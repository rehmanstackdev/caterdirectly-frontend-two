
import { useState } from "react";
import { FileText, Search, Plus, FolderPlus, Edit, Trash2, Eye, Image } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for content items
const mockPages = [
  {
    id: "page-1",
    title: "Home Page",
    path: "/",
    lastUpdated: "2025-04-12T08:30:00Z",
    status: "published",
    author: "Admin User"
  },
  {
    id: "page-2",
    title: "About Us",
    path: "/about",
    lastUpdated: "2025-03-28T14:15:00Z",
    status: "published",
    author: "Admin User"
  },
  {
    id: "page-3",
    title: "Terms and Conditions",
    path: "/terms",
    lastUpdated: "2025-04-02T09:45:00Z",
    status: "published",
    author: "Legal Team"
  },
  {
    id: "page-4",
    title: "Privacy Policy",
    path: "/privacy",
    lastUpdated: "2025-04-02T10:20:00Z",
    status: "published",
    author: "Legal Team"
  },
  {
    id: "page-5",
    title: "New Feature Announcement",
    path: "/blog/new-feature",
    lastUpdated: "2025-04-25T16:10:00Z",
    status: "draft",
    author: "Marketing Team"
  }
];

const mockMedia = [
  {
    id: "media-1",
    name: "hero-banner.jpg",
    type: "image/jpeg",
    size: "1.2 MB",
    dimensions: "1920x1080",
    uploadedAt: "2025-04-10T08:30:00Z",
    uploadedBy: "Design Team"
  },
  {
    id: "media-2",
    name: "company-logo.png",
    type: "image/png",
    size: "0.4 MB",
    dimensions: "512x512",
    uploadedAt: "2025-03-15T11:20:00Z",
    uploadedBy: "Design Team"
  },
  {
    id: "media-3",
    name: "product-catalog.pdf",
    type: "application/pdf",
    size: "3.8 MB",
    dimensions: "N/A",
    uploadedAt: "2025-04-20T14:45:00Z",
    uploadedBy: "Marketing Team"
  },
  {
    id: "media-4",
    name: "testimonial-video.mp4",
    type: "video/mp4",
    size: "24.6 MB",
    dimensions: "1280x720",
    uploadedAt: "2025-04-05T09:15:00Z",
    uploadedBy: "Marketing Team"
  }
];

function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pages");

  // Filter content based on search query
  const filteredPages = mockPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    page.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedia = mockMedia.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dashboard userRole="super-admin" activeTab="content">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Content Management</h1>
          
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
            <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pages">Pages & Content</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="settings">Content Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Pages & Content</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Page
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell className="font-mono text-sm">{page.path}</TableCell>
                        <TableCell>{formatDate(page.lastUpdated)}</TableCell>
                        <TableCell>
                          <Badge className={page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {page.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{page.author}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Media Library</CardTitle>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" /> Upload Media
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          {item.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.type}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.dimensions}</TableCell>
                        <TableCell>{formatDate(item.uploadedAt)}</TableCell>
                        <TableCell>{item.uploadedBy}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testimonials">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Testimonials Management</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This module will allow you to manage customer testimonials and reviews to display on the website.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Content Settings</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  Configure content settings, SEO defaults, and publishing workflows.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}

export default ContentManagement;
