import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";

export default createGlobalStyle`
    ${normalize}
    *,
    *:after,
    *:before {
        box-sizing: border-box;
        font-family: monospace;
        position: relative;
    }

    body {
        font-size: 18px;
    }

    ::selection {
        background-color: #073;
        color: white;
    }
`;
