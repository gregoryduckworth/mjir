import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Policy } from "@shared/schema";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContentLoader } from "@/components/ui/loading";
import { PolicyCard } from "@/components/policy/policy-card";
import { PolicyViewer } from "@/components/policy/policy-viewer";

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/policies"],
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/policies/categories"],
  });

  // Filter policies based on search and category
  const filteredPolicies = policies.filter((policy: Policy) => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          policy.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || policy.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Company Policies</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search policies"
            className="pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between sm:items-center">
          <CardTitle className="text-lg mb-4 sm:mb-0">All Policies</CardTitle>
          <div className="flex">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ContentLoader text="Loading policies..." />
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? (
                <p>No policies found matching "{searchQuery}"</p>
              ) : (
                <p>No policies available in this category</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map((policy: Policy) => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  onClick={handleOpenPolicy}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PolicyViewer 
        policy={selectedPolicy} 
        isOpen={!!selectedPolicy} 
        onClose={() => setSelectedPolicy(null)} 
      />
    </div>
  );
}
