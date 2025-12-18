import { ChatsBadge } from '@/components/ADMIN/Badges/ChatsBadge/ChatsBadge';
import { ReportsBadge } from '@/components/ADMIN/Badges/ReportsBadge/ReportsBadge';

export function ChatPage() {
    return (
        <div className="admin-page admin-main-chat-page">
            <ChatsBadge />
            <ReportsBadge />
        </div>
    );
}
