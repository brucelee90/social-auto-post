import React from 'react';

interface Props {
    discountsArray: {
        codeDiscount: { title: string };
    }[];
}

function DiscountsPicker(props: Props) {
    const { discountsArray } = props;

    return (
        <>
            <div>Discounts:</div>
            <ul>
                {discountsArray.map((e, key) => {
                    return (
                        <li key={key}>
                            <input
                                type="radio"
                                id={`code-discount-${e.codeDiscount.title}`}
                                name="code_discount"
                                value={e.codeDiscount.title}
                            />
                            <label htmlFor={`code-discount-${e.codeDiscount.title}`}>
                                {e.codeDiscount.title}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export default DiscountsPicker;
