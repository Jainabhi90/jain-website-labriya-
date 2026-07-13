# Contributor Guidelines - Labriya Chaturmas Portal

Thank you for contributing to the **Labriya Chaturmas Portal** project! To maintain code readability and system performance, please review and follow these operational standards.

---

## 📂 Project Structure

Before submitting a change, please locate the correct directory for your edits:
- **`src/app/`**: Route definitions and page-level layouts.
- **`src/components/`**: Reusable component views.
- **`src/services/`**: Network requests, mock data, and service calls.
- **`src/lib/`**: SDK setups (such as Supabase integrations).
- **`docs/`**: Schema designs, roadmaps, and API documentation files.

---

## 🌿 Branch Naming Conventions

All branch names should use the following prefixes, followed by the ticket number or issue reference:
- **`feat/`**: Introducing new features (e.g. `feat/sadhana-streaks`).
- **`fix/`**: Applying code bug fixes (e.g. `fix/countdown-hydration`).
- **`docs/`**: Modifying schemas or readmes (e.g. `docs/api-specs`).
- **`perf/`**: Enhancing assets or query logic (e.g. `perf/index-optimization`).

---

## 💬 Commit Message Formats

We adhere to the **Conventional Commits** specification. Ensure all commit titles follow this pattern:
```text
<type>(<scope>): <short description>
```

### Supported Commit Types:
- **`feat`**: Adding new functionality.
- **`fix`**: Resolving errors or bugs.
- **`docs`**: Editing documentation files.
- **`style`**: Reformatting typography or whitespace (no functional code changes).
- **`refactor`**: Reorganizing module files without adding new functionality.
- **`test`**: Creating or updating test suites.

### Examples:
- `feat(auth): integrate SMS verification OTP triggers`
- `fix(panchang): default date picker coordinates to dynamic today`
- `docs(db): detail profiles schema foreign key constraints`

---

## 📏 Coding Standards & Formatting

- **JavaScript (ES6+)**:
  - Prefer arrow functions and functional hooks over React class declarations.
  - Destructure component props clearly for readability.
- **Tailwind CSS**:
  - Set margins and paddings using standard variables rather than arbitrary inline styles.
- **Hydration Protections**:
  - Guard browser configurations (such as date parsing or local storage calls) inside client mount hooks to prevent server/client layout mismatches.

---

## 📬 Pull Request (PR) Checklist

Before creating a PR, verify that your changes satisfy the following checks:
- [ ] Code compiles cleanly with no Next.js build errors (`npm run build`).
- [ ] Linting evaluations pass with no warnings.
- [ ] RLS database configurations have been checked.
- [ ] Localization targets include Hindi keys for any new visual text.
- [ ] PR descriptions clearly outline the additions and link the associated issue.
