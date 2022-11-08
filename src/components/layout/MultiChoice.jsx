import { useState, useReducer } from 'react'

function MultiChoice({ filter, handleOptionChanged }) {

    // const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    const toggleAllOptionsSelect = () => {
        var checked = 0
        for (var i = 0; i < filter.items.length; i++) {
            var item = filter.items[i]
            checked += item.selected ? 1 : 0
        }
        if (checked == filter.items.length) {
            filter.allselected = false
            for (var i = 0; i < filter.items.length; i++) {
                var item = filter.items[i]
                item.selected = false
            }
        }
        else {
            filter.allselected = true
            for (var i = 0; i < filter.items.length; i++) {
                var item = filter.items[i]
                item.selected = true
            }
        }
        // console.log('toggleAll checked', checked, filter)
        // forceUpdate()
        handleOptionChanged(filter, null)
    }

    const selectAll = () => {
        filter.allselected = true
        for (var i = 0; i < filter.items.length; i++) {
            var item = filter.items[i]
            item.selected = true
        }
        handleOptionChanged(filter, null)
    }

    const selectNone = () => {
        filter.allselected = false
        for (var i = 0; i < filter.items.length; i++) {
            var item = filter.items[i]
            item.selected = false
        }
        handleOptionChanged(filter, null)
    }

    const selectServes = () => {
        filter.allselected = false
        for (var i = 0; i < filter.items.length; i++) {
            var item = filter.items[i]
            item.selected = (i >= 0 && i < 4)
        }
        handleOptionChanged(filter, null)
    }

    const selectReturns = () => {
        filter.allselected = false
        for (var i = 0; i < filter.items.length; i++) {
            var item = filter.items[i]
            item.selected = (i > 3 && i <= 7)
        }
        handleOptionChanged(filter, null)
    }

    const toggleOptionSelect = (item) => {
        if (filter.singleSelection)
        {
            item.selected = true
            filter.selectedValues = [item.name]
            for (var i = 0; i < filter.items.length; i++) {
                var xitem = filter.items[i]
                if (xitem !== item)
                {
                    xitem.selected = false
                }
            }
        }
        else
        {
            item.selected = !item.selected
            // console.log('Item, Option', item, filter)
            filter.selectedValues = []
            var checked = 0
            for (var i = 0; i < filter.items.length; i++) {
                var item = filter.items[i]
                checked += item.selected ? 1 : 0
                if (item.selected)
                {
                    filter.selectedValues.push(item.name)
                }
            }
            filter.allselected = (checked === filter.items.length)
        }
        handleOptionChanged(filter, item)
    }

    // console.log('MultiChoice', filter)
    return (
        <div>
            <div className="options-list-item pb-1 pl-1">
                {
                    filter.singleSelection === false ?
                    <div className="flex flex-col">
                    <div className="flex space-x-4">
                        <button className="flex btn btn-sm" onClick={() => selectAll()}>Select All</button>
                        <button className="flex btn btn-sm" onClick={() => selectNone()}>Select None</button>
                    </div>
                    {
                        filter.title == "Shots" ?
                            <div className="flex space-x-4 pt-1">
                                <button className="flex btn btn-sm" onClick={() => selectServes()}>All Serves</button>
                                <button className="flex btn btn-sm" onClick={() => selectReturns()}>All Returns</button>
                            </div> : null
                    }
                    </div> :
                    <div></div>
                }
            </div>
            <ul className="px-2">
                {filter.items.map((item, index) => {
                    return (
                        <li key={index}>
                            <div className="options-list-item pb-1">
                                <div className="left-section">
                                    <input
                                        key={Math.random()}
                                        type="checkbox"
                                        id={`custom-checkbox-${index}`}
                                        name={item.name}
                                        value={item.name}
                                        defaultChecked={item.selected}
                                        onChange={() => toggleOptionSelect(item)}
                                    />
                                    <label className='text-base-400 text-xs ml-2' htmlFor={`custom-checkbox-${index}`}>{item.name.toUpperCase()}</label>
                                </div>
                                <div className="right-section text-red-700 text-xs">{item.amount > 0 ? item.amount : ""}</div>
                            </div>
                        </li>
                    );
                })}
                <li>
                    <div className="options-list-item">
                        {/* <div className="left-section">Total:</div>
                        <div className="right-section">{10}</div> */}
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default MultiChoice