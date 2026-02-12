import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ServiceSelection } from '@/types/order';
import { 
  Plus, 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Palette
} from 'lucide-react';

interface CartSection {
  id: string;
  name: string;
  description?: string;
  color: string;
  isCollapsed: boolean;
  displayOrder: number;
  itemIds: string[];
}

interface CartSectionManagerProps {
  sections: CartSection[];
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  onSectionsChange: (sections: CartSection[]) => void;
  onMoveItem: (itemId: string, fromSectionId: string, toSectionId: string) => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

export const CartSectionManager = ({
  sections,
  selectedServices,
  selectedItems,
  onSectionsChange,
  onMoveItem,
}: CartSectionManagerProps) => {
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [newSectionColor, setNewSectionColor] = useState(defaultColors[0]);

  const getItemsInSection = useCallback((section: CartSection) => {
    const services = selectedServices.filter(service => 
      section.itemIds.includes(service.id)
    );
    const items = Object.entries(selectedItems).filter(([itemId]) =>
      section.itemIds.includes(itemId)
    );
    return { services, items };
  }, [selectedServices, selectedItems]);

  const getUnassignedItems = useCallback(() => {
    const assignedIds = new Set(sections.flatMap(s => s.itemIds));
    const unassignedServices = selectedServices.filter(service => 
      !assignedIds.has(service.id)
    );
    const unassignedItems = Object.entries(selectedItems).filter(([itemId]) =>
      !assignedIds.has(itemId)
    );
    return { services: unassignedServices, items: unassignedItems };
  }, [sections, selectedServices, selectedItems]);

  const createSection = useCallback(() => {
    const newSection: CartSection = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim() || 'New Section',
      description: newSectionDescription,
      color: newSectionColor,
      isCollapsed: false,
      displayOrder: sections.length,
      itemIds: [],
    };

    onSectionsChange([...sections, newSection]);
    setNewSectionDialogOpen(false);
    setNewSectionName('');
    setNewSectionDescription('');
    setNewSectionColor(defaultColors[0]);
  }, [sections, newSectionName, newSectionDescription, newSectionColor, onSectionsChange]);

  const updateSection = useCallback((sectionId: string, updates: Partial<CartSection>) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const deleteSection = useCallback((sectionId: string) => {
    const sectionToDelete = sections.find(s => s.id === sectionId);
    if (!sectionToDelete) return;

    // Move items back to unassigned
    const updatedSections = sections.filter(s => s.id !== sectionId);
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    updateSection(sectionId, { 
      isCollapsed: !sections.find(s => s.id === sectionId)?.isCollapsed 
    });
  }, [sections, updateSection]);

  const addItemToSection = useCallback((itemId: string, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.itemIds.includes(itemId)) return;

    updateSection(sectionId, {
      itemIds: [...section.itemIds, itemId]
    });
  }, [sections, updateSection]);

  const removeItemFromSection = useCallback((itemId: string, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      itemIds: section.itemIds.filter(id => id !== itemId)
    });
  }, [sections, updateSection]);

  const unassignedItems = getUnassignedItems();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Cart Organization</h3>
        <Dialog open={newSectionDialogOpen} onOpenChange={setNewSectionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cart Section</DialogTitle>
              <DialogDescription>
                Organize your cart items into logical sections for better management.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Appetizers, Main Course, Beverages"
                />
              </div>
              <div>
                <Label htmlFor="section-description">Description (Optional)</Label>
                <Input
                  id="section-description"
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  placeholder="Brief description of this section"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        newSectionColor === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSectionColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSection}>
                Create Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unassigned Items */}
      {(unassignedItems.services.length > 0 || unassignedItems.items.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              Unassigned Items
              <Badge variant="secondary" className="text-xs">
                {unassignedItems.services.length + unassignedItems.items.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignedItems.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{service.name}</span>
                    <Badge variant="outline" className="text-xs">Service</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {sections.map((section) => (
                        <DropdownMenuItem
                          key={section.id}
                          onClick={() => addItemToSection(service.id, section.id)}
                        >
                          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: section.color }}></div>
                          {section.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {unassignedItems.items.map(([itemId, quantity]) => (
                <div key={itemId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">Item {itemId}</span>
                    <Badge variant="outline" className="text-xs">Qty: {quantity}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {sections.map((section) => (
                        <DropdownMenuItem
                          key={section.id}
                          onClick={() => addItemToSection(itemId, section.id)}
                        >
                          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: section.color }}></div>
                          {section.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const sectionItems = getItemsInSection(section);
        const totalItems = sectionItems.services.length + sectionItems.items.length;

        return (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionCollapse(section.id)}
                    className="h-auto p-1"
                  >
                    {section.isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: section.color }}></div>
                  <CardTitle className="text-sm">{section.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {totalItems}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingSectionId(section.id)}>
                      <Edit3 className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSectionCollapse(section.id)}>
                      {section.isCollapsed ? (
                        <>
                          <Eye className="w-3 h-3 mr-2" />
                          Expand
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-2" />
                          Collapse
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteSection(section.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {section.description && (
                <p className="text-xs text-gray-600 ml-6">{section.description}</p>
              )}
            </CardHeader>
            {!section.isCollapsed && (
              <CardContent>
                {totalItems === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No items in this section. Drag items here or use the + button on unassigned items.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sectionItems.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{service.name}</span>
                          <Badge variant="outline" className="text-xs">Service</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromSection(service.id, section.id)}
                          className="h-auto p-1 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {sectionItems.items.map(([itemId, quantity]) => (
                      <div key={itemId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">Item {itemId}</span>
                          <Badge variant="outline" className="text-xs">Qty: {quantity}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromSection(itemId, section.id)}
                          className="h-auto p-1 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};