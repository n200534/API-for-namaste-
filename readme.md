

# 🏗️ 1. High-Level Architecture

```
+---------------------------------------------------------------+
|                       EMR / HIS / Mobile App                  |
|                 (FHIR Client, Indian EHR compliant)           |
+----------------------------+----------------------------------+
                             |
                FHIR Bundles (Patient, Encounter, ProblemList)
                             |
                             v
+---------------------------------------------------------------+
|                Integration API Gateway (Microservice)         |
|   - Terminology API (Search ICD-11 TM2, NAMASTE)              |
|   - Translation Service (NAMASTE <-> ICD-11 TM2)              |
|   - Bundle Upload API (Dual Coding)                           |
|   - Auth Service (OAuth2 + ABHA token validation)             |
+---------------------------------------------------------------+
       |                  |                        |
       v                  v                        v
+-------------+   +---------------+       +---------------------+
| FHIR Server |   | Terminology DB|       |  ABHA Auth Service  |
| (HAPI/Blaze)|   | (ICD-11, NAMASTE)     |  (NDHM sandbox /    |
| stores      |   | + Mapping Table )     |   ABDM gateway )    |
+-------------+   +---------------+       +---------------------+
```

---

# ⚙️ 2. Key Microservices

### 1. **API Gateway**

* Routes traffic to microservices
* Handles **rate limiting, TLS termination**
* Integrates with **OAuth2.0 provider** (Keycloak / ABDM sandbox)

---

### 2. **Translation Service**

* Core logic: map **NAMASTE codes ⇆ ICD-11 TM2 codes**
* DB: `mapping(source_code, source_system, target_code, target_system, relation, confidence)`
* Provides:

  * `GET /translate?code=NAMC123&system=NAMASTE`
  * `POST /translate/batch`

---

### 3. **FHIR Bundle Upload Service**

* `POST /bundle` → accepts **FHIR Bundle** with:

  * `Patient` (linked to ABHA ID)
  * `Encounter`
  * `Condition` / `ProblemListItem` (with dual coding)
* Parses + validates → pushes to **FHIR server** (HAPI FHIR)

Example `Condition` resource (dual coded):

```json
{
 "resourceType": "Condition",
 "id": "cond-123",
 "subject": {"reference": "Patient/abha-12345"},
 "code": {
   "coding": [
     {"system": "http://namaste.ayush.gov.in/namc", "code": "NAMC0123", "display": "Kasa"},
     {"system": "http://id.who.int/icd/release/11/mms", "code": "SK01.2", "display": "Cough"}
   ],
   "text": "Kasa (Cough)"
 }
}
```

---

### 4. **Terminology Service**

* Search NAMASTE, ICD-11 TM2, mappings
* `GET /search?term=kasa&system=namaste`
* `GET /search?term=cough&system=icd11-tm2`
* Index stored in **Postgres/ElasticSearch** for fast search

---

### 5. **Auth Service**

* Validates **ABHA token** (JWT) with ABDM
* Implements OAuth 2.0 Authorization Code or Client Credentials flow
* Adds RBAC (clinician vs curator vs admin)

---

# 🗄️ 3. Databases

* **Postgres (RDBMS)**

  * `terminology` (ICD11, NAMASTE tables)
  * `mapping` (cross-mappings)
  * `audit_logs` (FHIR Bundle uploads, ABHA auth logs)

* **Redis**

  * Cache translations and search results

* **Elasticsearch** *(optional)*

  * Full-text search for ICD-11/NAMASTE concepts

* **FHIR Server DB**

  * Managed separately by HAPI FHIR (stores Patient, Encounter, Condition, etc.)

---

# 🔐 4. Security

* **OAuth 2.0 / OIDC** with **ABHA token**
* Every request must include:

  ```
  Authorization: Bearer <ABHA-Token>
  ```
* Backend verifies token against **ABDM Auth Gateway**
* Audit trail:

  * Who uploaded what
  * Time, IP, ABHA ID
  * Stored in `audit_logs`

---

# 🔄 5. Workflow (User-Centric)

### Step 1: Doctor searches term

* Doctor types “kasa”
* EMR calls `GET /search?term=kasa&system=namaste`
* API returns:

  * NAMASTE code
  * ICD-11 TM2 code
  * Suggested mapping

---

### Step 2: Doctor records dual diagnosis

* Doctor selects NAMASTE + ICD code
* EMR builds **FHIR Condition** with dual coding

---

### Step 3: Bundle upload

* EMR creates a **FHIR Bundle**:

  * Patient (linked with ABHA ID)
  * Encounter
  * Condition (dual coding)
* Calls `POST /bundle`
* API validates → stores in FHIR server → logs event

---

### Step 4: Translation Service (if needed)

* If only NAMASTE code available → API auto-maps to ICD-11 TM2
* Stored in **mapping table** for reuse

---

### Step 5: Retrieval & Analytics

* Researcher/admin can `GET /translate` or query FHIR server
* Ministry can pull aggregate ICD-11 coded data for public health

---

# 🛠️ 6. Implementation Steps

1. **Set up FHIR Server**

   * Use HAPI FHIR JPA server (Java, Spring Boot)
   * Deploy locally or on Kubernetes

2. **Create Terminology DB**

   * Import ICD-11 TM2 JSON/XML dump from WHO
   * Import NAMASTE codes from AYUSH portal
   * Build mapping table

3. **Develop Translation Service**

   * API endpoints for mapping lookups
   * Store curated mappings

4. **Bundle Upload Service**

   * Accepts FHIR Bundles
   * Validates JSON schema
   * Pushes to FHIR server REST API

5. **Auth Service**

   * Integrate with ABDM sandbox for ABHA token validation

6. **API Gateway**

   * Use **Kong API Gateway / NGINX**
   * Route `/bundle`, `/search`, `/translate`

7. **Testing**

   * Unit tests (translation logic)
   * Integration tests (FHIR upload → FHIR server)
   * Security tests (invalid tokens, replay attacks)

8. **Deployment**

   * Microservices on Docker/Kubernetes
   * Postgres + Redis
   * FHIR server cluster

---

# 📊 7. Example Deployment Topology

```
k8s cluster
 ├── pod: api-gateway (NGINX/Kong)
 ├── pod: terminology-service
 ├── pod: translation-service
 ├── pod: bundle-upload-service
 ├── pod: auth-service
 ├── pod: hapi-fhir-server
 ├── pod: postgres
 └── pod: redis
```

---

# ✅ Benefits

* ✅ **Standards-compliant** (FHIR, Indian EHR, ABDM/ABHA, ICD-11 TM2)
* ✅ **Dual coding** → supports AYUSH + biomedical integration
* ✅ **Secure & auditable** (OAuth2 + ABHA + audit logs)
* ✅ **Lightweight microservices** → easy to scale per hospital/EMR

---

