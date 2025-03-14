import { Route, Switch } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import DashboardPage from "@/pages/dashboard-page";
import HolidayPage from "@/pages/holiday-page";
import PoliciesPage from "@/pages/policies-page";
import LearningPage from "@/pages/learning-page";
import OrganizationPage from "@/pages/organization-page";
import ProfilePage from "@/pages/profile-page";

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto md:ml-[280px]">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/holiday" component={HolidayPage} />
          <Route path="/policies" component={PoliciesPage} />
          <Route path="/learning" component={LearningPage} />
          <Route path="/organization" component={OrganizationPage} />
          <Route path="/profile/:id" component={ProfilePage} />
        </Switch>
      </main>
      
      <MobileNav />
    </div>
  );
}
