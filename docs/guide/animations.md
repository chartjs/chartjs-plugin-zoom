# Animations

The drag-to-zoom animation can be customized by configuring the `zoom` transition in your chart config:

```javascript
{
  options: {
    transitions: {
      zoom: {
        animation: {
          duration: 1000,
          easing: 'easeOutCubic'
        }
      }
    }
  }
}
```

If you want to disable zoom animations:

```javascript
{
  options: {
    transitions: {
      zoom: {
        animation: {
          duration: 0
        }
      }
    }
  }
}
```
