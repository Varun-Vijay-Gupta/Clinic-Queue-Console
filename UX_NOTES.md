# UX Notes

## User and Context

The main user is a clinic receptionist who can be interrupted frequently by patients, phone calls, and staff. Because they only look at the screen for a few seconds at a time, the interface should be quick to scan and simple to use.

I designed it to work on a desktop or around a 10-inch tablet.

## Main Design Decisions

### 1. Seven columns in the main table

The table shows only the information needed for queue management:

* Position
* Customer Name
* Visit Type
* Priority
* Wait Time
* Status
* Actions

The remaining customer details are available in a right-side drawer.

This keeps the table easier to scan and avoids horizontal scrolling, especially on smaller screens.

### 2. Long-wait warnings

For waits of 15 minutes or more, I use several warning signals:

* ⚠️ icon near the name
* ⏱️ icon in the wait time
* Bold customer name
* Warning-style wait-time pill
* Left border on the row

This avoids depending only on color and makes important waits easier to notice.

### 3. Polling and new arrivals

The queue refreshes every 3 seconds. New customers are detected and shown using a banner and temporary row highlight.

I chose this instead of constantly reordering the visible list because sudden movement could make the receptionist click the wrong row while working.

## Customer Details

The system stores all 14 required customer fields, but they are not all shown in the main table.

The table contains the main operational information, while the drawer contains details such as:

* Customer ID
* Name
* Date of Birth
* Gender
* Phone
* Email
* Address
* Medicare Number
* Allergies
* Medications
* Notes

The drawer also shows queue-related information such as check-in time, wait time, queue, position, doctor, insurance, and appointment ID.

This keeps the main queue simple while still making all required information available.

## What I Would Test First

I would test the customer drawer with real receptionists.

For example, I would ask them to find a customer's phone number or Medicare number, close the drawer, and continue working with the queue.

I would check whether the drawer opens quickly, whether the important information is easy to find, and whether focus returns to the correct place after closing.
