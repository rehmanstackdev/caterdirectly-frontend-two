import { Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Immediate load for homepage
import Index from "../pages/Index";

// Lazy load heavy routes for better performance
const Marketplace = lazy(() => import("../pages/Marketplace"));
const VenuePage = lazy(() => import("../pages/VenuePage"));
const VenueDetail = lazy(() => import("../pages/VenueDetail"));
const InvoiceViewPage = lazy(() => import("../pages/InvoiceViewPage"));
const InvoiceThankYouPage = lazy(() => import("../pages/InvoiceThankYouPage"));
const InvoiceDeclinedPage = lazy(() => import("../pages/InvoiceDeclinedPage"));
const OrderSummaryPage = lazy(() => import("../pages/OrderSummaryPage"));
const EventRsvpPage = lazy(() => import("../pages/EventRsvpPage"));
const GroupOrderInvitation = lazy(
  () => import("../pages/GroupOrderInvitation"),
);
const GroupOrderInviteStart = lazy(
  () => import("../pages/GroupOrderInviteStart"),
);
const GuestTicketPaymentPage = lazy(
  () => import("../pages/GuestTicketPaymentPage"),
);
const VendorApplication = lazy(
  () => import("../pages/vendor/VendorApplication"),
);
const SetupPasswordPage = lazy(() => import("../pages/SetupPasswordPage"));
const AcceptInvitationPage = lazy(
  () => import("../pages/AcceptInvitationPage"),
);
const SubmitReviewPage = lazy(() => import("../pages/SubmitReviewPage"));
const SubmitReviewsPage = lazy(() => import("../pages/SubmitReviewsPage"));
const ReviewsPage = lazy(() => import("../pages/ReviewsPage"));
const InvoiceReviewsPage = lazy(() => import("../pages/InvoiceReviewsPage"));
const SubmitInvoiceVendorReviewPage = lazy(
  () => import("../pages/SubmitInvoiceVendorReviewPage"),
);

// Keep lightweight pages as regular imports
import NotFound from "../pages/NotFound";
import OgImage from "../pages/OgImage";
import OgSplash from "../pages/OgSplash";

const PublicRoutes = (
  <>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route
      path="/marketplace"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <Marketplace />
        </Suspense>
      }
    />
    <Route
      path="/venues"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <VenuePage />
        </Suspense>
      }
    />
    <Route
      path="/venues/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <VenueDetail />
        </Suspense>
      }
    />

    {/* Public invoice routes */}
    <Route
      path="/invoices/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceViewPage />
        </Suspense>
      }
    />
    {/* Public order summary route with invoiceId */}
    <Route
      path="/order-summary/:invoiceId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <OrderSummaryPage />
        </Suspense>
      }
    />
    <Route
      path="/group-order/host-summary/:invoiceId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <OrderSummaryPage />
        </Suspense>
      }
    />
    <Route
      path="/invoices/thank-you/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceThankYouPage />
        </Suspense>
      }
    />
    <Route
      path="/invoices/declined"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceDeclinedPage />
        </Suspense>
      }
    />

    {/* Redirect old proposal URLs */}
    <Route
      path="/proposals/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceViewPage />
        </Suspense>
      }
    />
    <Route
      path="/proposals/thank-you"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceThankYouPage />
        </Suspense>
      }
    />

    {/* Public event RSVP routes */}
    <Route
      path="/events/:id/rsvp/:guestId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <EventRsvpPage />
        </Suspense>
      }
    />
    <Route
      path="/rsvp/:token"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <EventRsvpPage />
        </Suspense>
      }
    />

    {/* Public group order invitation route */}
    <Route
      path="/group-order/invite-start/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <GroupOrderInviteStart />
        </Suspense>
      }
    />
    <Route
      path="/group-order/invite/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <GroupOrderInvitation />
        </Suspense>
      }
    />
    <Route
      path="/invite/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <GroupOrderInvitation />
        </Suspense>
      }
    />

    {/* Public guest ticket payment route */}
    <Route
      path="/guest-ticket-payment/:id"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <GuestTicketPaymentPage />
        </Suspense>
      }
    />
    {/* Hidden OG image routes */}
    <Route path="/og-image" element={<OgImage />} />
    <Route path="/ogsplash" element={<OgSplash />} />

    {/* Vendor application route */}
    <Route
      path="/vendor/application"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <VendorApplication />
        </Suspense>
      }
    />

    {/* Vendor team invitation route */}
    <Route
      path="/accept-invitation"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <AcceptInvitationPage />
        </Suspense>
      }
    />

    {/* Password setup route */}
    <Route
      path="/setup-password"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <SetupPasswordPage />
        </Suspense>
      }
    />

    {/* Review submission routes */}
    <Route
      path="/submit-review"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <SubmitReviewPage />
        </Suspense>
      }
    />
    <Route
      path="/submit-reviews"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <SubmitReviewsPage />
        </Suspense>
      }
    />

    {/* Reviews page route */}
    <Route
      path="/reviews"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <ReviewsPage />
        </Suspense>
      }
    />
    <Route
      path="/reviews/vendor/:vendorId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <ReviewsPage />
        </Suspense>
      }
    />
    <Route
      path="/reviews/invoice/:invoiceId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <InvoiceReviewsPage />
        </Suspense>
      }
    />
    <Route
      path="/reviews/invoice/:invoiceId/vendor/:vendorId"
      element={
        <Suspense
          fallback={<div className="min-h-screen bg-muted/5 animate-pulse" />}
        >
          <SubmitInvoiceVendorReviewPage />
        </Suspense>
      }
    />

    {/* 404 route */}
    <Route path="*" element={<NotFound />} />
  </>
);

export default PublicRoutes;
