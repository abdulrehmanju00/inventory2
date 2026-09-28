import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useAppStore } from './store/AppStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

// Admin Shell Components
import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';

// 31 React Page Components (29 Locked Workspace Screens + Screen 30: Login + Screen 31: SuperAdminDashboard)
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddIngredient from './pages/AddIngredient';
import IngredientDetail from './pages/IngredientDetail';
import AddStock from './pages/AddStock';
import StockCounts from './pages/StockCounts';
import StartStockCount from './pages/StartStockCount';
import StockCountDetail from './pages/StockCountDetail';
import ReviewFinalize from './pages/ReviewFinalize';
import Wastage from './pages/Wastage';
import RecordWastage from './pages/RecordWastage';
import WastageDetail from './pages/WastageDetail';
import Transfers from './pages/Transfers';
import NewTransfer from './pages/NewTransfer';
import TransferDetail from './pages/TransferDetail';
import Purchases from './pages/Purchases';
import CreatePurchase from './pages/CreatePurchase';
import PurchaseDetail from './pages/PurchaseDetail';
import Suppliers from './pages/Suppliers';
import AddSupplier from './pages/AddSupplier';
import SupplierDetail from './pages/SupplierDetail';
import Recipes from './pages/Recipes';
import AddRecipe from './pages/AddRecipe';
import RecipeDetail from './pages/RecipeDetail';
import Production from './pages/Production';
import RecordProduction from './pages/RecordProduction';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import Login from './pages/Login'; // Screen 30
import SuperAdminDashboard from './pages/SuperAdminDashboard'; // Screen 31
import AdminRestaurants from './pages/AdminRestaurants'; // Screen 32
import AdminAddRestaurant from './pages/AdminAddRestaurant'; // Screen 33
import AdminRestaurantDetail from './pages/AdminRestaurantDetail'; // Screen 34
import AdminRestaurantSetup from './pages/AdminRestaurantSetup'; // Screen 35
import AdminBranches from './pages/AdminBranches'; // Screen 36
import AdminAddBranch from './pages/AdminAddBranch'; // Screen 37
import AdminBranchDetail from './pages/AdminBranchDetail'; // Screen 41
import AdminRestaurantUsers from './pages/AdminRestaurantUsers'; // Screen 38
import AdminAddUser from './pages/AdminAddUser'; // Screen 39
import AdminUsers from './pages/AdminUsers'; // Screen 40
import AdminPlans from './pages/AdminPlans'; // Screen 42

import './app.css';

const RESTAURANT_ROUTE_PAGE_MAP = {
  'dashboard': Dashboard,
  'inventory': Inventory,
  'add-ingredient': AddIngredient,
  'ingredient-detail': IngredientDetail,
  'add-stock': AddStock,
  'stock-counts': StockCounts,
  'new-stock-count': StartStockCount,
  'stock-count-detail': StockCountDetail,
  'stock-count-review': ReviewFinalize,
  'wastage': Wastage,
  'new-wastage': RecordWastage,
  'wastage-detail': WastageDetail,
  'transfers': Transfers,
  'new-transfer': NewTransfer,
  'transfer-detail': TransferDetail,
  'purchases': Purchases,
  'new-purchase': CreatePurchase,
  'purchase-detail': PurchaseDetail,
  'suppliers': Suppliers,
  'add-supplier': AddSupplier,
  'supplier-detail': SupplierDetail,
  'recipes': Recipes,
  'add-recipe': AddRecipe,
  'recipe-detail': RecipeDetail,
  'production': Production,
  'record-production': RecordProduction,
  'reports': Reports,
  'staff': Staff,
  'settings': Settings
};

const ADMIN_ROUTES = new Set([
  'super-admin',
  'admin-restaurants',
  'admin-add-restaurant',
  'admin-restaurant-setup',
  'admin-restaurant-detail',
  'admin-users',
  'admin-plans',
  'admin-settings',
  'admin-branches',
  'admin-branch-detail',
  'admin-add-branch',
  'admin-restaurant-users',
  'admin-add-user'
]);

function getRawRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
  return hash;
}

// Super Admin Layout Shell
function AdminShell({ currentRoute, onNavigate }) {
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  const { selectedRestaurantId } = useAppStore();

  let AdminPageComponent;
  if (currentRoute === 'super-admin') {
    AdminPageComponent = SuperAdminDashboard;
  } else if (currentRoute === 'admin-restaurants') {
    AdminPageComponent = AdminRestaurants;
  } else if (currentRoute === 'admin-add-restaurant') {
    AdminPageComponent = AdminAddRestaurant;
  } else if (currentRoute === 'admin-restaurant-detail') {
    AdminPageComponent = AdminRestaurantDetail;
  } else if (currentRoute === 'admin-restaurant-setup') {
    AdminPageComponent = AdminRestaurantSetup;
  } else if (currentRoute === 'admin-branches') {
    AdminPageComponent = AdminBranches;
  } else if (currentRoute === 'admin-branch-detail') {
    AdminPageComponent = AdminBranchDetail;
  } else if (currentRoute === 'admin-add-branch') {
    AdminPageComponent = AdminAddBranch;
  } else if (currentRoute === 'admin-restaurant-users') {
    AdminPageComponent = AdminRestaurantUsers;
  } else if (currentRoute === 'admin-add-user') {
    AdminPageComponent = AdminAddUser;
  } else if (currentRoute === 'admin-users') {
    AdminPageComponent = AdminUsers;
  } else if (currentRoute === 'admin-plans') {
    AdminPageComponent = AdminPlans;
  } else {
    // Clean "Coming Next" state for reserved admin routes
    const placeholderMeta = {
      'admin-settings': {
        title: 'Platform Global Settings — Coming Next',
        subtitle: 'Configure platform-wide operational policies, regional defaults, and telemetry.'
      }
    };

    const currentMeta = placeholderMeta[currentRoute] || {
      title: 'Platform Module — Coming Next',
      subtitle: 'This screen is scheduled for the upcoming platform milestone.'
    };

    AdminPageComponent = () => (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[36px]">construction</span>
          </div>
          <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-2">
            {currentMeta.title}
          </h2>
          <p className="text-body-md text-secondary max-w-lg mx-auto mb-6">
            {currentMeta.subtitle}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('super-admin')}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Back to Platform Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <AdminSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        mobileOpen={mobileAdminOpen}
        onCloseMobile={() => setMobileAdminOpen(false)}
      />
      <AdminHeader
        onOpenMobile={() => setMobileAdminOpen(true)}
        onNavigate={onNavigate}
      />
      <div className="lg:pl-64 w-full">
        <main className="w-full pt-20 bg-surface min-h-screen px-4 lg:px-gutter-lg pb-margin-desktop">
          <AdminPageComponent onNavigate={onNavigate} />
        </main>
      </div>
      <Toast />
    </div>
  );
}

function MainLayout() {
  const { currentUser } = useAppStore();

  // Resolve target route with frontend-only prototype route guarding
  const resolveGuardedRoute = useCallback((requestedHash) => {
    // 1. Unauthenticated -> always redirect to #login
    if (!currentUser) {
      return 'login';
    }

    // 2. Platform Admin -> cannot enter Restaurant Workspace; restricted to admin routes
    if (currentUser.accountType === 'platform_admin') {
      if (ADMIN_ROUTES.has(requestedHash)) {
        return requestedHash;
      }
      return 'super-admin';
    }

    // 3. Restaurant User -> cannot enter Super Admin screens or #login
    if (currentUser.accountType === 'restaurant_user') {
      if (ADMIN_ROUTES.has(requestedHash) || requestedHash === 'login' || !requestedHash) {
        return 'dashboard';
      }
      return RESTAURANT_ROUTE_PAGE_MAP[requestedHash] ? requestedHash : 'dashboard';
    }

    return 'login';
  }, [currentUser]);

  const [currentRoute, setCurrentRoute] = useState(() => {
    const raw = getRawRouteFromHash();
    return resolveGuardedRoute(raw);
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync route and guard state whenever currentUser or hash changes
  useEffect(() => {
    const raw = getRawRouteFromHash();
    const resolved = resolveGuardedRoute(raw);
    setCurrentRoute(resolved);
    if (window.location.hash !== `#${resolved}`) {
      window.location.hash = resolved;
    }

    const onHashChange = () => {
      const nextRaw = getRawRouteFromHash();
      const nextResolved = resolveGuardedRoute(nextRaw);
      setCurrentRoute(nextResolved);
      if (window.location.hash !== `#${nextResolved}`) {
        window.location.hash = nextResolved;
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentUser, resolveGuardedRoute]);

  const handleNavigate = (routeKey) => {
    const resolved = resolveGuardedRoute(routeKey);
    if (window.location.hash !== `#${resolved}`) {
      window.location.hash = resolved;
    } else {
      setCurrentRoute(resolved);
      window.scrollTo(0, 0);
    }
  };

  // Screen 30: Dedicated standalone Login layout (no workspace or admin shell)
  if (currentRoute === 'login') {
    return <Login onNavigate={handleNavigate} />;
  }

  // Super Admin Shell (Screens 31 and reserved platform administration routes)
  if (ADMIN_ROUTES.has(currentRoute) || currentUser?.accountType === 'platform_admin') {
    return <AdminShell currentRoute={currentRoute} onNavigate={handleNavigate} />;
  }

  // 29 Locked Restaurant Workspace Screens
  const PageComponent = RESTAURANT_ROUTE_PAGE_MAP[currentRoute] || Dashboard;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      {/* Shared Restaurant Workspace Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Shared Restaurant Workspace Header */}
      <Header
        onOpenMobile={() => setMobileSidebarOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area without any iframes */}
      <div className="lg:pl-64 w-full">
        <main className="w-full pt-20 bg-surface min-h-screen px-4 lg:px-gutter-lg pb-margin-desktop">
          <PageComponent onNavigate={handleNavigate} />
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
