import {Result} from "../Types";
import ResultItem from "./Result";
import './Search.css'

type ListItems = {
    searchResults: boolean;
    items: Array<Result>;
    onClickCallback: (arg0: Result) => void;
    raise: (index: number) => void;
    lower: (index: number) => void;
}

function getItems(values: ListItems): Array<JSX.Element>{
    const rows: Array<JSX.Element> = [];
    for (let i = 0; i < values.items.length; i ++) {
        const results = values.items;
        rows.push(
            <ResultItem key={results[i].id}
                        isSearchResult={values.searchResults}
                        index={i + 1}
                        result={results[i]}
                        onClickCallback={values.onClickCallback}
                        raise={values.raise}
                        lower={values.lower}></ResultItem>
            );
    }
    return rows;
}

export default function AlbumList(props: ListItems) {
    const albumEntries = getItems(props);
    return (
        <div>
            {albumEntries}
        </div>
    );
}