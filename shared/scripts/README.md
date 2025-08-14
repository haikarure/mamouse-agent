# Shared Scripts Directory

This directory contains **global utility scripts** used across the Mamouse Agent application, following SSOT (Single Source of Truth) architecture principles.

## 📁 Current Scripts

### **System Utilities**
- `MamouseToggle.ahk` - AutoHotkey script for global application toggle (Alt+Space hotkey)

## 🔄 **Recent File Reorganization (COMPLETED)**

The following files have been moved to more appropriate locations for better architecture:

### **Files Relocated:**
- ✅ `renderer.js` → **Moved to `core/renderer.js`** (Core application initialization)
- ✅ `essential-functions.js` → **Moved to `shared/services/essential-functions.js`** (Service-level functionality)
- ✅ `production-mode.js` → **Moved to `shared/utils/production-mode.js`** (Utility for production optimization)

### **Files Kept in shared/scripts/:**
- ✅ `MamouseToggle.ahk` - System-level utility (correctly placed)
- ✅ `README.md` - Documentation (correctly placed)

## 🎯 SSOT Script Organization

### **Global Scripts (shared/scripts/)**
Place scripts here if they are:
- System-wide utilities (hotkeys, automation)
- Application-level functionality (start/stop, monitoring)
- Cross-platform build scripts
- Global development tools
- Shared automation scripts

### **Component-Specific Scripts (components/[component-name]/scripts/)**
Place scripts in component directories if they are:
- Component-specific automation
- Feature-specific build scripts
- Component testing scripts
- Component-specific utilities

## 📝 Usage Guidelines

### **AutoHotkey Script (MamouseToggle.ahk)**
- **Purpose**: Provides global Alt+Space hotkey to toggle Mamouse Agent
- **Functionality**: 
  - Detects if Electron is running
  - Starts application with `npm start` if not running
  - Closes application if running
  - Shows system tray notifications
- **Usage**: Run the script to enable global hotkey functionality

### **Path References**
The AutoHotkey script automatically detects the application root directory by:
```autohotkey
; Gets parent directory (up two levels from shared\scripts)
ScriptPath := A_ScriptDir
ParentPath := SubStr(ScriptPath, 1, InStr(ScriptPath, "\shared\scripts") - 1)
```

## 🔄 Migration Pattern

When adding new scripts:
1. **Determine Scope**: Is the script global or component-specific?
2. **Place Appropriately**: 
   - Global utilities → `shared/scripts/`
   - Component-specific → `components/[component-name]/scripts/`
3. **Update Documentation**: Add script description to appropriate README
4. **Test Functionality**: Ensure scripts work from new location

## 🛠️ Development Guidelines

### **Script Types**
- **System Scripts**: OS-level automation (AutoHotkey, shell scripts)
- **Build Scripts**: Application build and deployment automation
- **Development Tools**: Development workflow automation
- **Monitoring Scripts**: Application monitoring and health checks

### **Best Practices**
- Use relative paths when possible
- Include error handling and logging
- Document script purpose and usage
- Test scripts after any path changes
- Follow platform-specific conventions

This organization ensures clean separation of global utilities from component-specific functionality while maintaining the SSOT architecture.
