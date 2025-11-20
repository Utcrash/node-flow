# Default Properties Component

## Overview

To reduce duplication in `nodeList.json`, you can now use the string `"default"` for the `propertiesComponentCode` field instead of repeating the full component code for every node.

## Usage

### In nodeList.json

Instead of including the full component code:

```json
{
  "template": {
    "propertiesComponentCode": "import React, { useState } from 'react'; ..."
  }
}
```

Simply use:

```json
{
  "template": {
    "propertiesComponentCode": "default"
  }
}
```

## What the Default Component Does

The default properties component (`src/components/defaultPropertiesComponent.ts`) provides:

1. **Automatic field rendering** based on parameter `inputType`:
   - `text` - Text input
   - `textarea` - Multi-line text area
   - `number` - Number input
   - `select` - Dropdown with options
   - `checkbox` - Boolean checkbox
   - `date` - Date picker

2. **Smart handling** of different parameter types:
   - JSON objects in textareas (with auto-parse)
   - Required field indicators
   - Parameter descriptions as help text

3. **Dark theme styling** matching your app's theme

4. **State management**:
   - Local state for real-time editing
   - Updates parent on blur (for text inputs) or change (for others)
   - Syncs with external property changes

## When to Use Custom Component Code

Use custom `propertiesComponentCode` when you need:
- Complex custom UI (e.g., visual editors, drag-drop)
- Special validation or formatting
- Integration with external services
- Custom layout or styling beyond the default

## Example Node Definition

```json
{
  "name": "my-node",
  "label": "My Node",
  "template": {
    "metadata": {
      "name": "my-node",
      "label": "My Node",
      "icon": "📦",
      "category": "PROCESS"
    },
    "parameters": [
      {
        "id": "param1",
        "name": "param1",
        "label": "Parameter 1",
        "type": "string",
        "inputType": "text",
        "required": true,
        "defaultValue": ""
      }
    ],
    "propertiesComponentCode": "default"
  }
}
```

This will automatically render a fully functional properties panel for your node!

