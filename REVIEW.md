# Code Review — `QueueList` component

Component under review:

```jsx
export default function QueueList({ locationId }) {
 const [entries, setEntries] = useState([]);
 useEffect(() => {
  fetch(`/api/locations/${locationId}/queue`)
   .then(r => r.json()).then(data => setEntries(data));
  setInterval(() => {
   fetch(`/api/locations/${locationId}/queue`)
    .then(r => r.json()).then(setEntries);
  }, 3000);
 }, []);
 const callNext = () => {
  entries[0].status = "called";
  setEntries(entries);
  fetch(`/api/queue/${entries[0].id}/call`, { method: "POST" });
 };
 return (
  <div>
   {entries.map((e, i) => (
    <div key={i} style={{ color: e.waitMins > 30 ? "red" : "black" }}>
     {e.name} - {e.waitMins} min
    </div>
   ))}
   <div className="btn" onClick={callNext}>Call Next</div>
  </div>
 );
}
```

# Code Review — `QueueList`

The original component has several issues related to React state, polling, error handling, accessibility, and queue reliability.

## Main Issues

### 1. Direct state mutation

`entries[0].status = "called"` changes the existing state directly. React may not detect the change correctly.

**Fix:** Create a new array and object when updating state.

### 2. Polling cleanup

The `setInterval` is never cleared, which can create multiple intervals and unnecessary API requests.

**Fix:** Clear the interval when the component unmounts or the location changes.

### 3. Missing `locationId` dependency

The effect uses `locationId` but has an empty dependency array. Changing the location can therefore keep showing the old queue.

**Fix:** Add `locationId` to the dependency array.

### 4. Polling race conditions

Multiple requests can finish in a different order and overwrite newer data.

**Fix:** Cancel/ignore outdated requests and clean up the previous polling interval.

### 5. Empty queue crash

`entries[0]` is used without checking if the queue is empty.

**Fix:** Add a guard and disable the Call Next button when there is nobody to call.

### 6. No API error handling

The code does not check `response.ok` or handle failed requests.

**Fix:** Use a fetch helper that checks the response and shows an error/retry message.

### 7. No rollback for failed actions

The UI changes to "called" before the API request finishes, but there is no rollback if the request fails.

**Fix:** Save the previous state, update optimistically, and restore it if the request fails.

### 8. Missing loading and empty states

An empty list could mean either "nobody is waiting" or "data has not loaded/failed."

**Fix:** Show separate loading, error, and empty states.

### 9. Index used as React key

`key={i}` can cause problems when queue items are added or reordered.

**Fix:** Use the stable entry ID: `key={entry.id}`.

### 10. Div used as a button

A clickable `<div>` is not keyboard accessible and does not have proper button semantics.

**Fix:** Use a real `<button>` with a disabled state.

### 11. Warning uses only color

Long waits were shown only using red text.

**Fix:** Use multiple signals such as warning icons, bold text, background styling, and accessible labels.

### 12. Other accessibility issues

The original code also lacked:

* Semantic table structure
* Visible focus states
* `aria-live` updates
* Proper TypeScript types

## Corrected Approach

The updated component uses:

* Proper TypeScript types
* `useEffect` cleanup for polling
* `locationId` as an effect dependency
* Stable React keys
* Loading, error, and empty states
* API response validation
* Optimistic updates with rollback
* Empty-queue checks
* Real buttons instead of clickable divs
* Multiple long-wait warning indicators
* Basic accessibility support

The main goal was to make the queue reliable, accessible, and safe for real front-desk use without making the component unnecessarily complicated.
