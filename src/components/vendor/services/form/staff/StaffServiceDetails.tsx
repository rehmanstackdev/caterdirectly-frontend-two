
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StaffServiceDetails as StaffDetails, StaffAttire, ExperienceLevel } from '@/types/service-types';

interface StaffServiceDetailsProps {
  formData: Partial<StaffDetails>;
  updateFormData: (data: Partial<StaffDetails>) => void;
}

const StaffServiceDetails: React.FC<StaffServiceDetailsProps> = ({ formData, updateFormData }) => {
  // Log the formData to help with debugging
  useEffect(() => {
    console.log('StaffServiceDetails formData:', formData);
  }, [formData]);

  const handleExperienceLevelChange = (value: ExperienceLevel) => {
    updateFormData({ qualificationsExperience: value });
  };

  const handleMinimumHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ minimumHours: parseInt(e.target.value) || 4 });
  };

  const handleAttireChange = (attireOption: StaffAttire, checked: boolean) => {
    const currentAttire = formData.attire || [];
    const newAttire = checked
      ? [...currentAttire, attireOption]
      : currentAttire.filter(a => a !== attireOption);

    updateFormData({ attire: newAttire });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block text-sm font-medium">Experience level</Label>
        <RadioGroup
          value={formData.qualificationsExperience || ''}
          onValueChange={(value) => handleExperienceLevelChange(value as ExperienceLevel)}
          className="grid grid-cols-2 gap-3"
        >
          <label
            htmlFor="entry_level"
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.qualificationsExperience === 'entry_level'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <RadioGroupItem value="entry_level" id="entry_level" className="border-orange-500 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
            <div>
              <span className="font-medium text-sm">Entry Level</span>
              <p className="text-xs text-gray-500">0-1 years</p>
            </div>
          </label>
          <label
            htmlFor="experienced"
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.qualificationsExperience === 'experienced'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <RadioGroupItem value="experienced" id="experienced" className="border-orange-500 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
            <div>
              <span className="font-medium text-sm">Experienced</span>
              <p className="text-xs text-gray-500">2-5 years</p>
            </div>
          </label>
          <label
            htmlFor="senior"
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.qualificationsExperience === 'senior'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <RadioGroupItem value="senior" id="senior" className="border-orange-500 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
            <div>
              <span className="font-medium text-sm">Senior</span>
              <p className="text-xs text-gray-500">5+ years</p>
            </div>
          </label>
          <label
            htmlFor="expert"
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.qualificationsExperience === 'expert'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <RadioGroupItem value="expert" id="expert" className="border-orange-500 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
            <div>
              <span className="font-medium text-sm">Expert</span>
              <p className="text-xs text-gray-500">10+ years</p>
            </div>
          </label>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="minimum-hours">Minimum Hours</Label>
        <Input
          id="minimum-hours"
          type="number"
          placeholder="4"
          value={formData.minimumHours || ''}
          onChange={handleMinimumHoursChange}
        />
        <p className="text-sm text-gray-500 mt-1">
          Minimum booking duration (in hours)
        </p>
      </div>
      
      <div>
        <Label className="mb-2 block">Attire Options</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="formal" 
              checked={(formData.attire || []).includes('formal')}
              onCheckedChange={(checked) => 
                handleAttireChange('formal', checked === true)
              }
            />
            <Label htmlFor="formal">Formal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="business_casual" 
              checked={(formData.attire || []).includes('business_casual')}
              onCheckedChange={(checked) => 
                handleAttireChange('business_casual', checked === true)
              }
            />
            <Label htmlFor="business_casual">Business Casual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="casual" 
              checked={(formData.attire || []).includes('casual')}
              onCheckedChange={(checked) => 
                handleAttireChange('casual', checked === true)
              }
            />
            <Label htmlFor="casual">Casual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="uniform" 
              checked={(formData.attire || []).includes('uniform')}
              onCheckedChange={(checked) => 
                handleAttireChange('uniform', checked === true)
              }
            />
            <Label htmlFor="uniform">Uniform</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffServiceDetails;
