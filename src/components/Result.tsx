import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro' // <-- import styles to be used
import { Result } from '../Types';
import './Search.css'

type ResultProps = {
    index: number;
    isSearchResult: boolean;
    result: Result;
    onClickCallback: (arg0: Result) => void;
    raise: (index: number) => void;
    lower: (index: number) => void;
}

export default function ResultItem(props: ResultProps) {
    let index: JSX.Element = <h2></h2>
    let movers: JSX.Element = <div></div>
    let addRmvText: string = "Add"
    
    if (!props.isSearchResult) {
        index = <h2 className="listNum">{props.index}</h2>
        movers = <div className="movers">
                <button onClick={() => props.raise(props.index - 1)}><FontAwesomeIcon icon={solid('coffee')} /></button>
                <button onClick={() => props.lower(props.index - 1)}>V</button>
        </div>;
        addRmvText = "Remove";
    }
    return (
        <div id="row"  key={props.result.id} 
                       onDragEnter={() => {console.log("Drag")}}
                       onDragLeave={() => {console.log("Drag")}}>
            {index}
            <img className="coverPreview" src={props.result.thumbnail} alt={props.result.title + " Cover Art"}></img>
            <div className="info">
                <div className="artist">{props.result.title}</div>
                <div className="artist"><b>{props.result.artist}</b></div>
            </div>
            <div className="moveButtons">
                {movers}
                <button onClick={() => props.onClickCallback(props.result)} className="addRmvBtn">{addRmvText}</button>
            </div>
        </div>
    );
}