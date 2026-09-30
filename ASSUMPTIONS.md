# Assumptions

The brief had a few unclear points, so I made the following assumptions.

## Long-wait threshold

I used **15 minutes (900 seconds)** as the long-wait threshold. This can be changed in `App.tsx` using `LONG_WAIT_THRESHOLD_SECONDS`.

## Polling

The queue refreshes every **3 seconds**, as mentioned in the brief. I also added a 1-second local timer so waiting times keep updating between polls.

## Called status

I treated **Called** as a patient who has already been called and is currently moving to the next step. Called patients appear near the top and have a **Mark Served** action.

## Served and No-show

Served and no-show customers remain in the data for the current session but are hidden from the default queue. Filters can be used to view them again.

## Moving customers

I used three queues: **General Consultation, Lab Work, and Vaccination**. A customer can be moved to another queue or location. Moving them resets the status to `waiting`, but keeps the original check-in time so their total waiting time is not lost.

## Call Next

`Call Next` selects the oldest waiting customer from the current queue. The main page button selects the oldest waiting customer across all queues in the selected location.

## Queue positions

Positions start from **1** and are recalculated after queue changes. Waiting and called customers are ordered by check-in time. Served/no-show positions are kept for history.

## New arrivals

New customers detected between polls are highlighted for a few seconds. A small message also shows how many new customers joined the queue.

## Empty states

Different messages are shown depending on the situation:

* Empty queue: "Queue is empty"
* Empty filter: "No-one waiting here"
* Error: error message with a retry option

## API failures

For polling failures, I keep the existing data instead of showing an error every few seconds.

For actions such as calling or serving a customer, I use **optimistic updates**. If the request fails, the previous state is restored and an error toast with a retry option is shown.

## Locations

I used **3 clinic locations**. Changing the location clears the current list and loads the queue for the selected location.

## Sample data

I used Australian-style sample data, including Medicare numbers, Australian phone numbers, addresses, and cities such as Sydney, Melbourne, and Brisbane.

## Accessibility

When the customer drawer opens, focus moves to the close button. Pressing **Escape** closes it, and focus returns to the previous element after closing.
