import axios from 'axios';

const ROOT_URL: string = "https://musicbrainz.org/ws/2/";
const IMG_ROOT_URL: string = "https://coverartarchive.org/";

export type Entity = 'artist' | 'release';
type Root = typeof ROOT_URL | typeof IMG_ROOT_URL;

interface IRequest {
    success: boolean;
    err?: string;
}

export interface ISearch<T extends IEntity> extends IRequest {
    count: number;
    created: string;
    offset: number;
    releases: Array<T>;
    length: number;
}

interface IArtist {
    artist: string;
    name: string;
}

interface IEntity extends IRequest {
    id: string;
}

export interface IRelease extends IEntity {
    "artist-credit": Array<IArtist>;
    date: string;
    title: string;
}

interface Thumbnail {250?: string, 500?: string, 1200?: string, small: string, large: string}

interface IImage {
    image: string;
    thumbnails: Thumbnail;
}

export interface IReleaseCover extends IEntity {
    images: Array<IImage>;
}

export default class MusicBrainzRequester {
    appName: string;
    appVer: string;
    appEmail: string;
    userAgent: string;
    
    timeLastSent: number;

    constructor({ appName, ver, email }: { appName: string; ver: string; email: string; }) {
        this.appName = appName;
        this.appVer = ver;
        this.appEmail = email;
        this.userAgent = `${this.appName}/${this.appVer} (${this.appEmail})`;

        this.timeLastSent = new Date().getTime();
    }

    canSend() {
        return (new Date().getTime()) - this.timeLastSent > 1000;
    }
    
    async get<T extends IRequest>(url: string, ignoreRates: boolean = false): Promise<T> {
        try {
            console.log("requesting: " + url);
            if(!this.canSend() && !ignoreRates)
                //TODO make queue
                throw new Error("Hasn't been 1 second between requests");
            const resp = (await axios.get<T>(url, {
                headers: { 'User-Agent': this.userAgent }
              })).data;
            const json: T = resp as T;
            json.success = true;
            this.timeLastSent = new Date().getTime();
            return json;
        } catch (err) {
            const error: IRequest = {success: false, err: "Something went wrong..."};
            return error as T;
        }
    }

    async search<T extends IRequest>(ent: Entity, entQuery: Array<{e: Entity, q: string}>, ignoreRates: boolean = false): Promise<T> {
        const query = entQuery.map(
        ({e,q}) => {
            if (q === '')
                return ''
            return e+':'+q
        }).join(' AND ');
        return await this.get<T>(`${ROOT_URL}${ent}/?query=${encodeURI(query)}`, ignoreRates);
    }

    async lookup<T extends IRequest>(root: Root, ent: Entity, mbid: string, ignoreRates: boolean = false): Promise<T> {
        return await this.get<T>(`${root}${ent}/${mbid}`, ignoreRates);
    }

    async albumSearch(entQuery: Array<{e: Entity, q: string}>): Promise<ISearch<IRelease>>{
        return await this.search<ISearch<IRelease>>('release', entQuery);
    }

    async albumLookup(mbid: string): Promise<IRelease>{
        return await this.lookup<IRelease>(ROOT_URL, 'release', mbid);
    }

    async albumArt(mbid: string): Promise<IReleaseCover> {
        return await this.lookup<IReleaseCover>(IMG_ROOT_URL, 'release', mbid, true);
    }
    
}