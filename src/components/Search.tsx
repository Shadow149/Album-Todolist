import { Component, Validator } from 'react';
import MusicBrainzRequester, { Entity, IRelease, IReleaseCover, ISearch } from '../api/MusicBrainzRequester';
import { Result } from '../Types';
import AlbumList from './AlbumList';
import './Search.css'
import { withCookies } from 'react-cookie';



type SearchState = {
    artistValue: string;
    recordValue: string;
    results: Array<Result>;
    list: Array<Result>;
    prevList: Array<Result>;
}

const MAX_RESULTS: number = 10;
const NO_COVER_ART: string = "https://upload.wikimedia.org/wikipedia/commons/9/9e/Box_Art_Not_Available.png";

class Search extends Component<any, SearchState> {

    state: SearchState = { recordValue: "", 
                           artistValue: '',
                           results: [], 
                           list: [], 
                           prevList: [],
                         };
    mbr: MusicBrainzRequester;

    constructor(props: any) {
        super(props);
        this.artistTextChange = this.artistTextChange.bind(this);
        this.recordTextChange = this.recordTextChange.bind(this);
        this.searchAlbum = this.searchAlbum.bind(this);

        this.updateCookie = this.updateCookie.bind(this);
        this.undo = this.undo.bind(this);

        this.addAlbum = this.addAlbum.bind(this);
        this.removeAlbum = this.removeAlbum.bind(this);

        this.moveAlbumDown = this.moveAlbumDown.bind(this);
        this.moveAlbumUp = this.moveAlbumUp.bind(this);

        this.mbr = new MusicBrainzRequester({
            appName: 'Album-Todo',
            ver: '0.1.0',
            email: 'robertsalfie14@gmail.com'
        });

        const { cookies } = props;
        try {
            const list = cookies.get('list');
            if (list === undefined)
                throw new Error("Cookies corrupt??");
            this.state.list = list;
            this.state.prevList = list;
        } catch {
            console.log("?????")
        }

    }

    resetResults() {
        this.setState({results: []});
    }

    async searchAlbum() {
        this.resetResults();
        const searchRes: ISearch<IRelease> = await this.getAlbumSearch();
        console.log(searchRes)

        if (!searchRes.success || searchRes.count === 0) {
            console.log("error");
            return;
        }

        for(let i = 0; i < Math.min(searchRes.count, MAX_RESULTS); i ++){

            const id: string = searchRes.releases[i].id
            const respLookup: IRelease = searchRes.releases[i];
            const title: string = respLookup.title;
            let artist: string = '';

            if (respLookup['artist-credit'].length > 0)
                artist = respLookup['artist-credit'].map((x) => x.name)
                                                    .join(', ');
            let artUrl: string = NO_COVER_ART;
            const cover: IReleaseCover = await this.getAlbumArt(respLookup);
            console.log(cover)

            if (cover.success && cover.images.length > 0)
                artUrl = cover.images[0].thumbnails.small;

            const res: Result = {
                thumbnail: artUrl,
                title: title,
                artist: artist,
                id: id,
            }
            
            this.state.results.push(res);

        }
        this.forceUpdate();
    }

    private async getAlbumArt(respLookup: IRelease): Promise<IReleaseCover> {
        return await this.mbr.albumArt(respLookup.id);
    }

    private async getAlbumSearch(): Promise<ISearch<IRelease>> {
        const query: Array<{e: Entity, q: string}> = [
            {e: 'release', q: this.state.recordValue.trim()},
            {e: 'artist', q: this.state.artistValue.trim()}
        ]
        return await this.mbr.albumSearch(query);
    }

    recordTextChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({recordValue: e.target.value});
    }

    artistTextChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({artistValue: e.target.value});
    }

    updateCookie() {
        const { cookies } = this.props;
        cookies.set('list', JSON.stringify(this.state.list));
        this.forceUpdate();
    }

    removeAlbum(result: Result) {
        // TODO optimise to hold index in result
        this.setState({prevList: [...this.state.list]});
        const i: number = this.state.list.findIndex( (r) => (r === result) );
        this.state.list.splice(i, 1);
        this.updateCookie();
    }

    addAlbum(result: Result) {
        this.setState({prevList: [...this.state.list]});
        const index = this.state.list.findIndex( (r) => (r === result));
        if (index !== -1)
            return;
        this.state.list.push(result);
        this.updateCookie();
    }
    
    swapItems(indexA: number, indexB: number) {
        this.setState({prevList: [...this.state.list]});
        let tmp = this.state.list[indexB];
        this.state.list[indexB] = this.state.list[indexA];
        this.state.list[indexA] = tmp;
        this.updateCookie();
    }

    moveAlbumUp(index: number) {
        if (index === 0)
            return;
        this.swapItems(index, index - 1);
    }
    
    moveAlbumDown(index: number) {
        if (index === this.state.list.length - 1)
            return;
        this.swapItems(index, index + 1);
    }

    undo() {
        this.setState({list: this.state.prevList});
        this.updateCookie();
    }

    render() {
        console.log("Search", this.state.list, this.state.results);
        return (
            <div id="container">
                <div id="list" className="colItem">
                    <h1>My List</h1>
                    <button onClick={this.undo}>Undo</button>
                    <AlbumList searchResults={false}
                               items={this.state.list} 
                               onClickCallback={this.removeAlbum}
                               raise={this.moveAlbumUp}
                               lower={this.moveAlbumDown}></AlbumList>
                </div>
                <div className="colItem">
                    <h1>Search</h1>
                    <label>Album: </label>
                    <input type="text" value={this.state.recordValue} onChange={this.recordTextChange} />
                    <button onClick={() => {this.setState({recordValue: ''})}}>Clear</button>
                    <br></br>
                    <label>Artist: </label>
                    <input type="text" value={this.state.artistValue} onChange={this.artistTextChange} />
                    <button onClick={() => {this.setState({artistValue: ''})}}>Clear</button>
                    <br></br>
                    <input type="submit" value="Search" onClick={this.searchAlbum}/>
                    <AlbumList searchResults={true}
                               items={this.state.results} 
                               onClickCallback={this.addAlbum}
                               raise={this.moveAlbumUp}
                               lower={this.moveAlbumDown}></AlbumList>
                </div>
            </div>
        );
    }
}

export default withCookies(Search);