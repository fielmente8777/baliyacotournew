'use client';

/**
 * My Account landing page, top to bottom:
 *
 *   welcome     burgundy greeting with "Start designing" and "Edit profile"
 *   numbers     orders, wishlist, unread updates, addresses (each a shortcut)
 *   panels      latest orders beside a peek at the wishlist
 *   profile     details, measurements, addresses
 *
 * so the most common jobs are one tap away. Each part is in ./overview.
 */

import OverviewSection from './overview/OverviewSection';
import ProfileShortcuts from './overview/ProfileShortcuts';
import RecentOrders from './overview/RecentOrders';
import StatTiles from './overview/StatTiles';
import WelcomeBanner from './overview/WelcomeBanner';
import WishlistPeek from './overview/WishlistPeek';

export default function AccountOverview() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <WelcomeBanner />

      <StatTiles />

      <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <OverviewSection eyebrow="Your orders" title="Recent orders" href="/my-account/orders" linkLabel="View all">
          <RecentOrders />
        </OverviewSection>
        <OverviewSection eyebrow="Saved for later" title="Wishlist" href="/my-account/wishlist" linkLabel="View all">
          <WishlistPeek />
        </OverviewSection>
      </div>

      <ProfileShortcuts />
    </div>
  );
}
