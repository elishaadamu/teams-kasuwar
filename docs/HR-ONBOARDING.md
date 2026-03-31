# HR Onboarding — Usage & Endpoints

Location
- Page component: app/hr-dashboard/onboarding/page.jsx

Purpose
- This page provides a staff onboarding form to register new staff (SM, BDM, BD, TL) and assign them to regions/teams.

Prerequisites
- API base URL set via `NEXT_PUBLIC_API_BASE_URL` or `API_CONFIG.BASE_URL`.
- Axios configured with `withCredentials: true` (the app sets axios.defaults.withCredentials in `app/layout.js`).
- Toast notifications via `react-toastify` are used for feedback.

Key Endpoints Used (from `configs/api.jsx`)

- `API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES`
  - Path: `/admin/regional/zones`
  - Method: GET
  - Usage: fetch region/zone list for the "Assign Region" select.
  - Example:
    ```js
    const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
    const zones = resp.data.zones;
    ```

- `API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS`
  - Path: `/admin/regional/zones/` (append `{zoneId}/teams`)
  - Method: GET
  - Usage: fetch teams for a selected region/zone and populate the "Assign Team" select.
  - Example:
    ```js
    const resp = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`), { withCredentials: true });
    const teams = resp.data.teams;
    ```

- `API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF`
  - Path: `/hr/register-staff`
  - Method: POST
  - Usage: submit the onboarding form payload to create a staff member.
  - Payload shape (approx):
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "08012345678",
      "role": "sm", // sm | bdm | bd | tl
      "password": "optional (falls back to phone if empty)",
      "gender": "male",
      "maritalStatus": "single",
      "dateOfBirth": "YYYY-MM-DD",
      "address": "...",
      "state": "Lagos",
      "localGovt": "Ikeja",
      "bankName": "Access Bank",
      "accountNumber": "0123456789",
      "accountName": "John Doe",
      "validId": "NIN or other ID",
      "passportPhoto": "base64-data-or-url",
      "teamId": "<teamId> (optional)",
      "isTeamLead": true|false,
      "isRegionalLeader": true|false,
      "regionalId": "<zoneId> (optional)"
    }
    ```
  - Example axios call used in the page:
    ```js
    const resp = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF), payload, { withCredentials: true });
    ```

- `API_CONFIG.ENDPOINTS.HR.GET_STAFF`
  - Path: `/hr/get-staff-list`
  - Method: GET
  - Usage: fetch existing staff list for the staff directory table.
  - Example:
    ```js
    const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
    const staff = resp.data.data;
    ```

Notes & Implementation Details
- File uploads: the page converts small passport images to base64 DataURL before sending. Adjust size limits if needed.
- Default password: if the `password` field is left blank, the implementation falls back to using the `phone` value as the temporary password.
- Team vs State: the page populates `teams` from `GET_ZONE_TEAMS` and assigns `teamId` to the staff; in other pages you may have used `state` or `team` interchangeably — be consistent by using `teamId` when assigning a member to a team.
- Toasts: the page uses `react-toastify` to surface success/failure messages. Ensure `ToastContainer` is mounted (it is in `app/layout.js`).

How to Reuse These Endpoints Elsewhere
1. Import `apiUrl` and `API_CONFIG`:
   ```js
   import { apiUrl, API_CONFIG } from '@/configs/api';
   import axios from 'axios';
   ```
2. Example: fetch zones for a control
   ```js
   const { data } = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
   setZones(data.zones || []);
   ```
3. Example: register staff programmatically
   ```js
   const result = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF), payload, { withCredentials: true });
   if (result.data?.success) {
     // handle success
   }
   ```

Where to Find the Code
- Onboarding page component: `app/hr-dashboard/onboarding/page.jsx`
- API config constants: `configs/api.jsx`

Troubleshooting
- If a GET returns empty arrays, inspect the network tab and copy the full JSON response here; I can update the parsing logic.
- If file uploads fail, check server expectations (multipart/form-data vs base64). The current page uses base64 for passport images.

If you want, I can also:
- Add example cURL commands for each endpoint.
- Create a small JS helper module that wraps these endpoint calls for reuse.

---
Generated on: 2026-03-31
