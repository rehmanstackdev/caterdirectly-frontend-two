
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import BookingFlow from '../pages/BookingFlow';
import OrderSummaryPage from '../pages/OrderSummaryPage';
import EditOrderPage from '../pages/EditOrderPage';
import EditGroupOrderPage from '../pages/EditGroupOrderPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import GroupOrderSetup from '../pages/GroupOrderSetup';
import GroupOrderReviewPage from '../pages/GroupOrderReviewPage';
import GroupOrderSummaryPage from '../pages/GroupOrderSummaryPage';
import GroupOrderConfirmationPage from '../pages/GroupOrderConfirmationPage';
import FavoritesPage from '../pages/FavoritesPage';

const OrderRoutes = (
  <>
    {/* Protected booking routes */}
    <Route path="/booking" element={
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    } />
    <Route path="/order-summary" element={
      <ProtectedRoute>
        <OrderSummaryPage />
      </ProtectedRoute>
    } />
    <Route path="/order-summary/:id" element={
      <ProtectedRoute>
        <OrderSummaryPage />
      </ProtectedRoute>
    } />
    <Route path="/edit-order/:id" element={
      <ProtectedRoute>
        <EditOrderPage />
      </ProtectedRoute>
    } />
    <Route path="/edit-group-order/:id" element={
      <ProtectedRoute>
        <EditGroupOrderPage />
      </ProtectedRoute>
    } />
    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

    {/* Group order routes */}
    <Route path="/group-order/*" element={
      <ProtectedRoute>
        <Routes>
          <Route path="setup" element={<GroupOrderSetup />} />
          <Route path="review" element={<GroupOrderReviewPage />} />
          <Route path="summary/:id" element={<GroupOrderSummaryPage />} />
          <Route path="summary" element={<GroupOrderSummaryPage />} />
          <Route path="confirmation" element={<GroupOrderConfirmationPage />} />
        </Routes>
      </ProtectedRoute>
    } />

    {/* Favorites route */}
    <Route path="/favorites" element={
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    } />
  </>
);

export default OrderRoutes;
