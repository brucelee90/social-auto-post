import { Select } from '@shopify/polaris';
import React from 'react';
import { ICollection } from '~/routes/global_utils/types';
import styles from './SearchAndFilterBar.module.css';

interface Props {
    collections: ICollection[];
    searchString: string;
    handleSearchString: (searchString: string) => void;
    handleCollectionFilter: (filterValue: string) => void;
}

function SearchAndFilterBar(props: Props) {
    const { collections, searchString, handleSearchString, handleCollectionFilter } = props;

    return (
        <div className={`${styles.filter_bar} row g-4`}>
            <div className="col">
                <select
                    className="form-select col"
                    id="product_filter"
                    onChange={(e) => handleCollectionFilter(e.target.value)}
                >
                    <option value="">All</option>
                    {collections.map((collection: ICollection, index) => (
                        <option key={index} value={collection.id}>
                            {collection.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col">
                <input
                    className="form-control col"
                    type="text"
                    placeholder="Search"
                    value={searchString}
                    onChange={(e) => handleSearchString(e.target.value)}
                />
            </div>
        </div>
    );
}

export default SearchAndFilterBar;
