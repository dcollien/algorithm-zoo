import { css } from "emotion";

export const toolbarContainer = css`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
`;

export const toolbarCss = css`
  display: flex;
  flex-direct: row;
  & button {
    margin-left: 0.5rem;
    text-transform: none;
    font-size: 1.3rem;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
  }
  & hr {
    box-sizing: border-box;
    border: 1px solid rgba(33,33,33,0.25);
    border-width: 0 1px 0 0;
    padding: 0;
    width: 0;
    height: auto;
    margin-left: 0.5rem;
    margin-right: 0;
    margin-top: 0;
    margin-bottom: 1rem;
  }
`;
