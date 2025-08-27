import React from 'react'
import { Button } from 'reactstrap';

const ScoresPagination = ({ pageNo, setPageNo, numberOfPages }) => {

    const previousPage = () => {
        setPageNo(Math.max(0, pageNo - 1));
    };

    const nextPage = () => {
        setPageNo(Math.min(numberOfPages - 1, pageNo + 1));
    };

    let middlePagination;

    if (numberOfPages <= 3) {

        middlePagination = [...Array(numberOfPages)].map((_, pageIndex) => (
            <Button
                outline color="success"
                style={pageNo === pageIndex + 1 ? { backgroundColor: "#157A6E", color: "#fff" } : null}
                key={pageIndex + 1}
                onClick={() => setPageNo(pageIndex + 1)}
                disabled={pageNo === pageIndex + 1}>
                {pageIndex + 1}
            </Button>
        ));
    }

    else {
        const startValue = Math.floor((pageNo - 1) / 3) * 3;

        middlePagination = (
            <>
                {[...Array(3)].map((_, pageIndex) => (
                    <Button
                        outline color="success"
                        style={pageNo === pageIndex + 1 ? { backgroundColor: "#157A6E", color: "#fff" } : null}
                        key={startValue + pageIndex + 1}
                        disabled={pageNo === startValue + pageIndex + 1}
                        onClick={() => setPageNo(startValue + pageIndex + 1)}>
                        {startValue + pageIndex + 1}
                    </Button>
                ))}

                <Button outline color="success" disabled>...</Button>
                <Button outline color="success" onClick={() => setPageNo(numberOfPages)}>{numberOfPages}</Button>
            </>
        );

        if (pageNo > 3) {

            if (numberOfPages - pageNo >= 3) {
                
                middlePagination = (
                    <>
                        <Button outline color="success" disabled>...</Button>

                        <Button
                            outline color="success"
                            onClick={() => setPageNo(startValue)}>
                            {startValue}
                        </Button>

                        {[...Array(3)].map((_, pageIndex) => (
                            <Button
                                outline color="success"
                                style={pageNo === startValue + pageIndex + 1 ? { backgroundColor: "#157A6E", color: "#fff" } : null}
                                key={startValue + pageIndex + 1}
                                disabled={pageNo === startValue + pageIndex + 1}
                                onClick={() => setPageNo(startValue + pageIndex + 1)}>
                                {startValue + pageIndex + 1}
                            </Button>
                        ))}

                        <Button outline color="success" disabled>...</Button>
                        <Button
                            outline color="success"
                            onClick={() => setPageNo(numberOfPages)}>
                            {numberOfPages}
                        </Button>
                    </>);
            }

            else {
                let amountLeft = numberOfPages - pageNo + 3;
                middlePagination = (
                    <>
                        <Button
                            outline color="success"
                            onClick={() => setPageNo(1)}>
                            1
                        </Button>

                        <Button outline color="success" disabled>...</Button>
                        <Button
                            outline color="success"
                            style={pageNo === startValue ? { backgroundColor: "#157A6E", color: "#fff" } : null}
                            onClick={() => setPageNo(startValue)}>
                            {startValue}
                        </Button>

                        {[...Array(amountLeft)].map((_, pageIndex) => (
                            <Button
                                outline color="success"
                                key={startValue + pageIndex + 1}
                                disabled={pageNo === startValue + pageIndex + 1}
                                style={pageNo === startValue + pageIndex + 1 ? { backgroundColor: "#157A6E", color: "#fff" } : numberOfPages < startValue + pageIndex + 1 ? { visibility: "hidden" } : null}
                                onClick={() => setPageNo(startValue + pageIndex + 1)}>
                                {startValue + pageIndex + 1}
                            </Button>
                        ))}
                    </>
                );
            }
        }
    }

    return (
        numberOfPages > 1 && (
            <div className="d-flex justify-content-around mx-auto mt-3 scores-pagination overflow-auto pb-2">
                <Button
                    color="info"
                    disabled={pageNo === 1}
                    onClick={previousPage}
                    className={pageNo < 2 ? `invisible` : `visible`}>
                    &#171;
                </Button>

                {middlePagination}

                <Button
                    color="info"
                    disabled={pageNo === numberOfPages}
                    onClick={nextPage}
                    className={pageNo === numberOfPages ? `invisible` : `visible`}>
                    &#187;
                </Button>
            </div>
        ));
};

export default ScoresPagination;