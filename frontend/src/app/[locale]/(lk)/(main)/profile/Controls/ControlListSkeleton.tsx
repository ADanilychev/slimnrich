import Skeleton from 'react-loading-skeleton';

export function ControlListSkeleton() {
    return (
        <div className="profile-page__controls">
            <Skeleton height={65} />
            <Skeleton height={65} />
            <Skeleton height={65} />
            <Skeleton height={65} />
            <Skeleton height={65} />
        </div>
    );
}
