# Shared Assets Directory

This directory contains **global assets** used across multiple components of the Mamouse Agent application, following SSOT (Single Source of Truth) architecture principles.

## 📁 Current Assets

### **Application Icons**
- `Mamouse Icon.ico` - Main application icon used by Electron window

## 🎯 SSOT Asset Organization

### **Global Assets (shared/assets/)**
Place assets here if they are:
- Used by multiple components
- Application-wide resources (logos, main icons)
- Global fonts or themes
- Shared images or media files

### **Component-Specific Assets (components/[component-name]/assets/)**
Place assets in component directories if they are:
- Used by only one specific component
- Component-specific icons or images
- Component-specific fonts or media
- Feature-specific resources

## 📝 Usage Guidelines

1. **Global First**: If an asset might be used by multiple components, place it in `shared/assets/`
2. **Component Specific**: If an asset is clearly tied to one component, place it in that component's `assets/` directory
3. **Path References**: Always use relative paths from the file that references the asset
4. **Testing**: Test asset loading with `npm start` after any changes

## 🔄 Migration Pattern

When adding new assets:
1. Determine if the asset is global or component-specific
2. Place in appropriate directory following SSOT principles
3. Update all references to use correct paths
4. Test functionality to ensure assets load correctly

This organization ensures clean separation of concerns and maintainable asset management.
