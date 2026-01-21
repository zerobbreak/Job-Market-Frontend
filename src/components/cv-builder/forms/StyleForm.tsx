import React from 'react';
import { useCVStore } from '../../../stores/cvStore';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';

const StyleForm: React.FC = () => {
  const { style, updateStyle } = useCVStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Theme Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={style.themeColor}
            onChange={(e) => updateStyle({ themeColor: e.target.value })}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            value={style.themeColor}
            onChange={(e) => updateStyle({ themeColor: e.target.value })}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={style.fontFamily}
          onValueChange={(value) => updateStyle({ fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter (Modern)</SelectItem>
            <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font Size</Label>
        <Select
          value={style.fontSize}
          onValueChange={(value: any) => updateStyle({ fontSize: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Layout Template</Label>
        <Select
          value={style.layout}
          onValueChange={(value: any) => updateStyle({ layout: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern (Sidebar)</SelectItem>
            <SelectItem value="classic">Classic (Top Down)</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StyleForm;
