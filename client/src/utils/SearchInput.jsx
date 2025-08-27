import React from 'react'
import searchImg from '../images/loupe.svg'

const SearchInput = ({ setSearchKey, placeholder }) => {

    return (
        <form className="form-inline mb-4">
            <div className="input-group mx-auto mt-2 mt-lg-5 search w-75">
                <input
                    type="text"
                    className="form-control "
                    placeholder={placeholder}
                    aria-label="Search"
                    onChange={e => { setSearchKey(e.target.value) }}
                />

                <div className="input-group-append ms-1 my-auto">
                    <span className="input-group-text py-1" id="basic-addon2" type="submit" style={{ border: "2px solid #ffc107" }}>
                        <img src={searchImg} alt="Quiz-Blog Search" width="20" height="20" />
                    </span>
                </div>
            </div>
        </form>
    )
}

export default SearchInput
