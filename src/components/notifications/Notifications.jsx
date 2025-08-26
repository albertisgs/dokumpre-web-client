import React, { useState, useRef, useCallback } from 'react';
import { useInfiniteNotifications } from './hooks/useInfiniteNotifications'; // <-- Gunakan hook baru
import { useMarkAllAsRead } from './hooks/useNotifications'; // Hook ini tetap dipakai
import { Bell, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteNotifications();
  
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  const unreadCount = data?.pages?.[0]?.unread_count || 0;

  // Logic untuk infinite scroll
  const observer = useRef();
  const lastNotificationElementRef = useCallback(node => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Fungsi utilitas untuk format waktu
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 3600;
    if (interval > 24) return Math.floor(interval / 24) + " days ago";
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex flex-col justify-center text-gray-600 hover:text-gray-800"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
             {unreadCount > 9 ? '9+' : unreadCount}
           </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
                <button onClick={() => markAllAsRead()} disabled={isPending} className="text-sm font-medium text-blue-600 hover:underline">
                    Mark all as read
                </button>
            )}
          </div>
          <div id="notification-list" className="max-h-80 overflow-y-auto">
            {isLoading && <div className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></div>}
            {isError && <div className="p-4 text-center text-red-500">Could not load notifications.</div>}
            
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.notifications.map((notif, index) => {
                  const isLastElement = index === page.notifications.length - 1;
                  return (
                    <a 
                      ref={isLastElement ? lastNotificationElementRef : null} 
                      key={notif.id} 
                      href={notif.link_to || '#'} 
                      className={`notification-dropdown-item group flex items-start ${!notif.is_read ? 'notification-item-unread' : 'notification-item-read'}`}
                    >
                      <span className="notification-item-dot mt-1.5"></span>
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{notif.title}</p>
                        {notif.message && <p className="text-sm text-gray-600">{notif.message}</p>}
                        <p className="text-xs text-gray-500">{timeSince(notif.created_at)}</p>
                      </div>
                    </a>
                  );
                })}
              </React.Fragment>
            ))}
            
            {isFetchingNextPage && <div className="p-2 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400"/></div>}
            
            {!hasNextPage && !isLoading && data?.pages[0].notifications.length > 0 &&
              <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-200">No more notifications</div>
            }

            {!isLoading && data?.pages[0].notifications.length === 0 &&
              <div className="p-4 text-center text-gray-500">You have no notifications</div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;