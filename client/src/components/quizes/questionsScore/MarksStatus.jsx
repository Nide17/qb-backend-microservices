import React from 'react'
import { Link } from 'react-router-dom'

const MarksStatus = ({ score, qnLength, passMark }) => {
    return (
        <div className="marks-status">

            {Math.round(score * 100 / qnLength) < passMark ?
                <>
                    <p className="text-center text-danger my-4">
                        Your efforts fell short this time. To achieve success, it's essential to dedicate more time to reading and practicing.
                    </p>

                    <h6 className='mb-4 mb-lg-5 fw-bolder'>
                        Please contact us for more important books, guidance that may help you.
                    </h6>

                    <Link to="/contact">
                        <button type="button" style={{ backgroundColor: "#157A6E", color: "#fff", border: "2px solid #ffc107", borderRadius: "10px", padding: "5px 12px", textDecoration: "underline" }}>
                            Contact us for help!
                        </button>
                    </Link>
                </> :
                <>
                    <h6 className="text-center text-primary my-5">
                        Congratulations on passing the test! Practice leads to deeper understanding. Reach out for related books or assistance anytime!
                    </h6>
                    <Link to="/contact">
                        <button type="button" style={{ backgroundColor: "#157A6E", color: "#fff", border: "2px solid #ffc107", borderRadius: "10px", padding: "5px 12px", textDecoration: "underline" }}>
                            Contact us for help!
                        </button>
                    </Link>
                </>}
        </div>
    )
}

export default MarksStatus