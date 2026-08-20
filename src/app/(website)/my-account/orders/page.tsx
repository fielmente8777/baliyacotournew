import AccountContent from '../components/AccountContent';
import OrderCard from './components/OrderCard';
import OrdersHeader from './components/OrdersHeader';
import { orders } from './pageData';

export default function OrdersPage() {
  return (
    <AccountContent>
      <OrdersHeader />

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </AccountContent>
  );
}
