import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { AccountSidebar, AccountTabId } from '../components/account/AccountSidebar';
import { AccountMobileNav } from '../components/account/AccountMobileNav';
import { AccountOverviewSection } from '../components/account/AccountOverviewSection';
import { AccountOrdersSection } from '../components/account/AccountOrdersSection';
import { OrderHistory } from '../components/account/OrderHistory';
import { AccountServicesSection } from '../components/account/AccountServicesSection';
import { AccountQuotesSection } from '../components/account/AccountQuotesSection';
import { AccountDocumentsSection } from '../components/account/AccountDocumentsSection';
import { AccountProfileSection } from '../components/account/AccountProfileSection';
import { AccountNotificationsSection } from '../components/account/AccountNotificationsSection';
import { AccountSavedSection } from '../components/account/AccountSavedSection';
import { AccountSettingsSection } from '../components/account/AccountSettingsSection';

import { documentService } from '../services/documents/documentService';
import { savedProductsService } from '../services/saved/savedProductsService';
import { notificationService } from '../services/notifications/notificationService';
import { paymentService } from '../services/payments/paymentService';
import { storageService } from '../services/storage/storageService';

import {
  CustomerDocument,
  SavedProduct,
  NotificationItem,
  PaymentTransaction
} from '../types';

import {
  Camera,
  UploadCloud,
  Trash2,
  Check,
  Loader2,
  X,
  Lock,
  LogOut,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  const {
    currentPath,
    navigateTo,
    orders,
    serviceTickets,
    quoteRequests,
    showToast,
    openModal,
    storeSettings
  } = useApp();

  const {
    currentUser,
    userProfile,
    logout,
    uploadProfilePhoto,
    removeProfilePhoto
  } = useAuth();

  const { t, language } = useTranslation();

  // Determine active tab from current URL path
  const getTabFromPath = (path: string): AccountTabId => {
    const clean = path.replace(/\/$/, '');
    if (clean.endsWith('/orders')) return 'orders';
    if (clean.endsWith('/service-requests')) return 'service-requests';
    if (clean.endsWith('/quotes')) return 'quotes';
    if (clean.endsWith('/documents')) return 'documents';
    if (clean.endsWith('/profile')) return 'profile';
    if (clean.endsWith('/notifications')) return 'notifications';
    if (clean.endsWith('/saved')) return 'saved';
    if (clean.endsWith('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AccountTabId>(getTabFromPath(currentPath));

  // Sync tab when currentPath updates (e.g. browser back/forward or programmatic navigation)
  useEffect(() => {
    setActiveTab(getTabFromPath(currentPath));
  }, [currentPath]);

  const handleTabChange = (tabId: AccountTabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigateTo('/account');
    } else {
      navigateTo(`/account/${tabId}`);
    }
  };

  // State for Customer Subcollections
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(false);

  // Sign out confirmation modal
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Profile Photo Upload State
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  // Filter items specifically for the authenticated user
  const userOrders = currentUser
    ? orders.filter(o => !o.customerId || o.customerId === currentUser.uid || o.customerEmail === currentUser.email)
    : [];

  const userTickets = currentUser
    ? serviceTickets.filter(t => !t.customerId || t.customerId === currentUser.uid || t.customerEmail === currentUser.email)
    : [];

  const userQuotes = currentUser
    ? quoteRequests.filter(q => !q.customerId || q.customerId === currentUser.uid || q.customerEmail === currentUser.email)
    : [];

  // Fetch subcollections when user is logged in
  const loadCustomerData = async () => {
    if (!currentUser?.uid) return;
    setIsLoadingCustomerData(true);
    try {
      const [docsRes, savedRes, payRes] = await Promise.all([
        documentService.getCustomerDocuments(currentUser.uid),
        savedProductsService.getSavedProducts(currentUser.uid),
        paymentService.getCustomerPayments(currentUser.uid)
      ]);
      setDocuments(docsRes);
      setSavedProducts(savedRes);
      setPayments(payRes);
    } catch (err) {
      console.warn('Error fetching customer data:', err);
    } finally {
      setIsLoadingCustomerData(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      loadCustomerData();

      // Listen to customer notifications in real time
      const unsubNotifications = notificationService.listenToUserNotifications(
        currentUser.uid,
        items => setNotifications(items)
      );

      // Listen to customer documents in real time
      const unsubDocuments = documentService.listenToCustomerDocuments(
        currentUser.uid,
        docs => setDocuments(docs)
      );

      // Listen to saved products in real time
      const unsubSaved = savedProductsService.listenToSavedProducts(
        currentUser.uid,
        items => setSavedProducts(items)
      );

      return () => {
        unsubNotifications();
        unsubDocuments();
        unsubSaved();
      };
    }
  }, [currentUser?.uid]);

  // Handle Photo Selection
  const processSelectedPhoto = (file: File) => {
    const validation = storageService.validateFile(file);
    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Faili Halifai' : 'Invalid File',
        message: (language === 'sw' ? validation.errorSw : validation.errorEn) || 'Invalid file format or size.'
      });
      return;
    }
    setSelectedPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const handleModalPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedPhoto(file);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedPhoto(file);
  };

  const performPhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    setUploadProgress(10);
    try {
      await uploadProfilePhoto(file, progress => {
        setUploadProgress(progress);
      });
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Picha Imepakiwa' : 'Photo Uploaded',
        message: language === 'sw' ? 'Picha ya wasifu imesasishwa kikamilifu!' : 'Profile photo updated successfully!'
      });
      setIsPhotoModalOpen(false);
      setSelectedPhotoFile(null);
      setPreviewImage(null);
    } catch (err: any) {
      console.warn('Profile photo upload error:', err);
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu ya Upakiaji' : 'Upload Failed',
        message: err.message || (language === 'sw' ? 'Haikuweza kupakia picha. Tafadhali jaribu tena.' : 'Could not upload photo. Please try again.')
      });
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = async () => {
    const confirmMessage = language === 'sw'
      ? 'Je, una uhakika unataka kuondoa picha yako ya wasifu?'
      : 'Are you sure you want to remove your profile photo?';

    if (window.confirm && !window.confirm(confirmMessage)) return;

    setIsUploadingPhoto(true);
    try {
      await removeProfilePhoto();
      showToast({
        type: 'info',
        title: language === 'sw' ? 'Picha Imeondolewa' : 'Photo Removed',
        message: language === 'sw' ? 'Picha ya wasifu imeondolewa.' : 'Profile photo removed.'
      });
      setIsPhotoModalOpen(false);
      setSelectedPhotoFile(null);
      setPreviewImage(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        message: err.message || 'Could not remove photo.'
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConfirmSignOut = async () => {
    setIsSignOutModalOpen(false);
    await logout();
    showToast({
      type: 'info',
      title: language === 'sw' ? 'Umetoka Salama' : 'Signed Out',
      message: language === 'sw' ? 'Umetoka salama kwenye akaunti yako.' : 'You have been signed out of your account.'
    });
    navigateTo('/');
  };

  // If user is not signed in, show clean customer portal authentication gate
  if (!currentUser) {
    return (
      <div className="py-12 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[75vh] flex items-center">
        <Container>
          <Breadcrumbs items={[{ label: language === 'sw' ? 'Akaunti ya Mteja' : 'Customer Account' }]} />

          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-6">
            <div className="bg-slate-900 text-white p-8 sm:p-10 text-center space-y-3">
              <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 font-black text-2xl shadow-md">
                TK
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                {language === 'sw' ? 'Akaunti ya Mteja — TK Stationery' : 'TK Customer Portal'}
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {language === 'sw'
                  ? 'Fuatilia maagizo yako ya vifaa, kazi za uchapaji, maombi ya mtandaoni, na risiti zako zote mahali pamoja.'
                  : 'Manage your office supply orders, printing requests, tech quotes, and digital documents in one secure workspace.'}
              </p>
            </div>

            <div className="p-8 sm:p-10 space-y-6 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => openModal({ type: 'auth', initialTab: 'login' })}
                  className="w-full justify-center min-h-[48px]"
                >
                  {language === 'sw' ? 'Ingia (Sign In)' : 'Sign In'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => openModal({ type: 'auth', initialTab: 'register' })}
                  className="w-full justify-center min-h-[48px]"
                >
                  {language === 'sw' ? 'Fungua Akaunti (Register)' : 'Create Account'}
                </Button>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'sw' ? 'Mfumo salama unaolinda taarifa zako (256-Bit SSL Secured)' : 'Protected by 256-Bit SSL Encryption'}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Calculate Badge counts
  const unreadNotificationsCount = notifications.filter(n => (n.status || '').toLowerCase() !== 'read').length;
  const badges: Record<AccountTabId, number> = {
    overview: 0,
    orders: userOrders.length,
    'service-requests': userTickets.length,
    quotes: userQuotes.length,
    documents: documents.length,
    profile: 0,
    notifications: unreadNotificationsCount,
    saved: savedProducts.length,
    settings: 0
  };

  const whatsappPaymentNumber = storeSettings?.paymentWhatsAppNumber || '0787754202';

  return (
    <div className="py-6 sm:py-8 bg-slate-50/60 dark:bg-slate-950 min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: language === 'sw' ? 'Akaunti ya Mteja' : 'Customer Account', path: '/account' },
              {
                label:
                  activeTab === 'overview'
                    ? (language === 'sw' ? 'Muhtasari' : 'Overview')
                    : activeTab === 'orders'
                    ? (language === 'sw' ? 'Oda Zangu' : 'Orders')
                    : activeTab === 'service-requests'
                    ? (language === 'sw' ? 'Huduma & Uchapaji' : 'Service Requests')
                    : activeTab === 'quotes'
                    ? (language === 'sw' ? 'Nukuu za Software' : 'Tech Quotes')
                    : activeTab === 'documents'
                    ? (language === 'sw' ? 'Nyaraka & Mafaili' : 'Documents Vault')
                    : activeTab === 'profile'
                    ? (language === 'sw' ? 'Wasifu & Taarifa' : 'Profile')
                    : activeTab === 'notifications'
                    ? (language === 'sw' ? 'Meseji & Taarifa' : 'Notifications')
                    : activeTab === 'saved'
                    ? (language === 'sw' ? 'Bidhaa Zilizohifadhiwa' : 'Saved Products')
                    : (language === 'sw' ? 'Mipangilio' : 'Settings')
              }
            ]}
          />
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden mb-6">
          <AccountMobileNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            badges={badges}
          />
        </div>

        {/* Admin Shortcut if authenticated as Admin or Staff */}
        {(userProfile?.role === 'super_admin' || userProfile?.role === 'admin' || userProfile?.role === 'staff') && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {language === 'sw' ? 'Umeingia kama Msimamizi' : 'Signed in as Administrator'} ({userProfile.fullName || 'Admin'})
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'sw' ? 'Una ruhusa kamili za kiutawala za kuona maagizo na kusimamia duka.' : 'You have administrator privileges to manage the store and requests.'}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/admin')}
              className="shrink-0 w-full sm:w-auto"
            >
              {language === 'sw' ? 'Fungua Jopo Kuu la Admin →' : 'Open Admin Dashboard →'}
            </Button>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Fixed / Sticky Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <AccountSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              badges={badges}
              onSignOutClick={() => setIsSignOutModalOpen(true)}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            />
          </div>

          {/* Right Column: Dynamic Section View */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0">
            {activeTab === 'overview' && (
              <AccountOverviewSection
                orders={userOrders}
                serviceTickets={userTickets}
                quoteRequests={userQuotes}
                documents={documents}
                savedProducts={savedProducts}
                notifications={notifications}
                payments={payments}
                whatsappNumber={whatsappPaymentNumber}
                onTabChange={handleTabChange}
                onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'orders' && (
              <OrderHistory
                initialOrders={userOrders}
                whatsappNumber={whatsappPaymentNumber}
                showToast={showToast}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'service-requests' && (
              <AccountServicesSection
                serviceTickets={userTickets}
                whatsappNumber={whatsappPaymentNumber}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'quotes' && (
              <AccountQuotesSection
                quotes={userQuotes}
                whatsappNumber={whatsappPaymentNumber}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'documents' && (
              <AccountDocumentsSection
                documents={documents}
                serviceTickets={userTickets}
                showToast={showToast}
                onRefresh={loadCustomerData}
              />
            )}

            {activeTab === 'profile' && (
              <AccountProfileSection
                onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === 'notifications' && (
              <AccountNotificationsSection
                notifications={notifications}
                onRefresh={loadCustomerData}
                showToast={showToast}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'saved' && (
              <AccountSavedSection
                savedProducts={savedProducts}
                onRefresh={loadCustomerData}
                showToast={showToast}
                onNavigatePath={navigateTo}
              />
            )}

            {activeTab === 'settings' && (
              <AccountSettingsSection
                onSignOut={() => setIsSignOutModalOpen(true)}
                showToast={showToast}
                onNavigatePath={navigateTo}
              />
            )}
          </div>
        </div>
      </Container>

      {/* ========================================================== */}
      {/* 1. PROFILE PHOTO UPLOAD MODAL (Intact & Validated) */}
      {/* ========================================================== */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'sw' ? 'Picha ya Wasifu ya Mteja' : 'Customer Profile Photo'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'sw' ? 'Itahifadhiwa kwenye Firebase Storage' : 'Secured via Firebase Storage'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setSelectedPhotoFile(null);
                  setPreviewImage(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={handleModalPhotoSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              {previewImage ? (
                <div className="space-y-3">
                  <div className="relative w-36 h-36 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-md">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {selectedPhotoFile?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {selectedPhotoFile ? `${(selectedPhotoFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline mt-1 inline-block py-1 min-h-[36px]"
                    >
                      {language === 'sw' ? 'Chagua picha tofauti' : 'Choose different image'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDraggingPhoto(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    setIsDraggingPhoto(false);
                  }}
                  onDrop={handlePhotoDrop}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    isDraggingPhoto
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {language === 'sw' ? 'Bofya kupakia au kokota picha hapa' : 'Click to select or drag & drop image'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    PNG, JPG, WEBP (Max 5MB)
                  </p>

                  {userProfile?.avatarUrl && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
                      <img
                        src={userProfile.avatarUrl}
                        alt="Current Profile"
                        className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                      />
                      <span className="text-[11px] text-slate-500">
                        {language === 'sw' ? 'Picha ya sasa inafanya kazi' : 'Current photo active'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              {isUploadingPhoto && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>{language === 'sw' ? 'Inapakia kwenye Firebase Storage...' : 'Uploading to Firebase Storage...'}</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                {userProfile?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 min-h-[44px] px-2 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Ondoa Picha' : 'Remove Photo'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setSelectedPhotoFile(null);
                    setPreviewImage(null);
                  }}
                  disabled={isUploadingPhoto}
                  className="min-h-[44px]"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => selectedPhotoFile && performPhotoUpload(selectedPhotoFile)}
                  disabled={!selectedPhotoFile || isUploadingPhoto}
                  icon={isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  className="min-h-[44px]"
                >
                  {isUploadingPhoto
                    ? (language === 'sw' ? 'Inapakia...' : 'Uploading...')
                    : (language === 'sw' ? 'Hifadhi Picha' : 'Save Photo')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. SIGN OUT CONFIRMATION MODAL */}
      {/* ========================================================== */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'sw' ? 'Ungependa Kutoka kwenye Akaunti?' : 'Sign Out of Your Account?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'sw'
                  ? 'Utahitaji kuingiza tena barua pepe na nenosiri lako ili kufungua akaunti hii baadaye.'
                  : 'You will need to sign in again to view your orders, tickets, and stored documents.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors min-h-[44px]"
              >
                {language === 'sw' ? 'Baki Hapa' : 'Stay Signed In'}
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors min-h-[44px]"
              >
                {language === 'sw' ? 'Toka Sasa' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { OrderHistory } from '../components/account/OrderHistory';
