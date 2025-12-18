import { PropsWithChildren } from 'react';

import './table.scss';

interface Props extends PropsWithChildren {}

export function Table({ children }: Props) {
    return <table className="table-ui">{children}</table>;
}

export const TableHeader = ({ children }: PropsWithChildren) => {
    return <thead>{children}</thead>;
};

export const TableHeaderCell = ({ children }: PropsWithChildren) => {
    return <th>{children}</th>;
};

export const TableBody = ({ children }: PropsWithChildren) => {
    return <tbody>{children}</tbody>;
};

export const TableBodyCell = ({ children }: PropsWithChildren) => {
    return <td>{children}</td>;
};

export const TableRow = ({ children }: PropsWithChildren) => {
    return <tr>{children}</tr>;
};
