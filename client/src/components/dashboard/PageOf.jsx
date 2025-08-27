import React from 'react'
import { Badge } from 'reactstrap'

const PageOf = ({ pageNo, numberOfPages }) => {
    return (
        <div className="text-end my-3 w-100">
            <span className='border rounded border-warning p-2 bg-warning'>
                <Badge color="success">
                    <b className='text-white'>{pageNo}</b>
                </Badge>&nbsp; | &nbsp;
                <Badge color="info">
                    <b className='text-white'>{numberOfPages}</b>
                </Badge>
            </span>
        </div>
    )
}

export default PageOf