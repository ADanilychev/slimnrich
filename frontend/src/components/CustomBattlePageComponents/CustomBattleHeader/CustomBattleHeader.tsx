interface Props {
    title: string;
    content?: string;
    subTitle?: string;
}

export function CustomBattleHeader({ title, content, subTitle }: Props) {
    return (
        <div className="custom-battle__header">
            {title && <h3>{title}</h3>}

            {content && <p>{content}</p>}

            {subTitle && <small>{subTitle}</small>}
        </div>
    );
}
