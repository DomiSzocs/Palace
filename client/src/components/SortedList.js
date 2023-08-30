import React from 'react';

function SortedList({list}) {
    list.sort((a, b) => {
        return a.points > b.points ? -1 : 1;
    });
    return (
        <div className='list-container'>
            <div className='list-scrollable'>
                <ol>
                    {
                        list.map((listItem) => {
                            return (
                                <li key={listItem.uid}>{`${listItem.name}: ${listItem.points}`}</li>
                            )
                        })
                    }
                </ol>
            </div>
        </div>
    );
}

export default SortedList;
