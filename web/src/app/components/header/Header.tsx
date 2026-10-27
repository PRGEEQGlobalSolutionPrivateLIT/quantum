
"use client";

import Image from "next/image";
import { Bell, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./header.css";

const SUPER_ADMIN_ROUTES: Record<string, string> = {
  "/superadmin_security": "Security and Access",
  "/superadmin_preferences": "Preferences",
  "/superadmin_audit": "Audit and system",
};

const PLATFORM_ADMIN_ROUTES: Record<string, string> = {
  "/platform_admin": "Profile and Identity",
  "/platformadmin": "Profile and Identity",
  "/platformadmin_profile": "Profile and Identity",
  "/platformadmin_security": "Security and Access",
  "/platformadmin_preferences": "Preferences",
  "/platformadmin_audit": "Audit and system",
};

const INSTITUTION_ADMIN_ROUTES: Record<string, string> = {
  "/institution_admin": "Profile and Identity",
  "/institutionadmin": "Profile and Identity",
  "/institutionadmin_profile": "Profile and Identity",
  "/institutionadmin_security": "Security and Access",
  "/institutionadmin_preferences": "Preferences",
  "/institutionadmin_audit": "Audit and system",
};

const BOOTCAMP_ROUTES: Record<string, string> = {
  "/bootcamp": "Profile and Identity",
  "/bootcamp_profile": "Profile and Identity",
  "/bootcamp/profile": "Profile and Identity",
  "/bootcamp_security": "Security and Access",
  "/bootcamp/security": "Security and Access",
  "/bootcamp_preferences": "Preferences",
  "/bootcamp/preferences": "Preferences",
  "/bootcamp_audit": "Audit and system",
  "/bootcamp/audit": "Audit and system",
};

const GOVERNMENT_ROUTES: Record<string, string> = {
  "/government": "Profile and Identity",
  "/government_profile": "Profile and Identity",
  "/government/profile": "Profile and Identity",
  "/government_coordinator": "Profile and Identity",
  "/government_coordinator/profile": "Profile and Identity",
  "/government_security": "Security and Access",
  "/government/security": "Security and Access",
  "/government_preferences": "Preferences",
  "/government/preferences": "Preferences",
  "/government_audit": "Audit and system",
  "/government/audit": "Audit and system",
};

const UNIVERSITY_ROUTES: Record<string, string> = {
  "/coordinator_university": "Profile and Identity",
  "/university": "Profile and Identity",
  "/university_profile": "Profile and Identity",
  "/university/profile": "Profile and Identity",
  "/university_security": "Security and Access",
  "/university/security": "Security and Access",
  "/university_preferences": "Preferences",
  "/university/preferences": "Preferences",
  "/university_audit": "Audit and system",
  "/university/audit": "Audit and system",
};

const COORDINATOR_BOOTCAMP_ROUTES: Record<string, string> = {
  "/coordinator_bootcamp": "Profile and Identity",
};

const COORDINATOR_CORPORATE_ROUTES: Record<string, string> = {
  "/coordinator_corporate": "Profile and Identity",
};

const COORDINATOR_GOVERNMENT_ROUTES: Record<string, string> = {
  "/coordinator_government": "Profile and Identity",
};

const COORDINATOR_NGO_ROUTES: Record<string, string> = {
  "/coordinator_ngo": "Profile and Identity",
};

const STUDENT_UNIVERSITY_ROUTES: Record<string, string> = {
  "/student_university": "Profile and Identity",
  "/student_university_profile": "Profile and Identity",
  "/student_university/profile": "Profile and Identity",
};

const STUDENT_BOOTCAMP_ROUTES: Record<string, string> = {
  "/student_bootcamp": "Profile and Identity",
  "/student_bootcamp_profile": "Profile and Identity",
  "/student_bootcamp/profile": "Profile and Identity",
};

const STUDENT_SKILLACADEMY_ROUTES: Record<string, string> = {
  "/student_skillacademy": "Profile and Identity",
  "/student_skillacademy_profile": "Profile and Identity",
  "/student_skillacademy/profile": "Profile and Identity",
};

const STUDENT_CORPORATE_ROUTES: Record<string, string> = {
  "/student_corporate": "Profile and Identity",
  "/student_corporate_profile": "Profile and Identity",
  "/student_corporate/profile": "Profile and Identity",
};

const STUDENT_GOVERNMENT_ROUTES: Record<string, string> = {
  "/student_government": "Profile and Identity",
  "/student_government_profile": "Profile and Identity",
  "/student_government/profile": "Profile and Identity",
};

const STUDENT_NGO_ROUTES: Record<string, string> = {
  "/student_ngo": "Profile and Identity",
  "/student_ngo_profile": "Profile and Identity",
  "/student_ngo/profile": "Profile and Identity",
};

const FACULTY_UNIVERSITY_ROUTES: Record<string, string> = {
  "/faculty_university": "Profile and Identity",
  "/faculty_university_profile": "Profile and Identity",
  "/faculty_university/profile": "Profile and Identity",
};

const FACULTY_SKILLACADEMY_ROUTES: Record<string, string> = {
  "/faculty_skillacademy": "Profile and Identity",
  "/faculty_skillacademy_profile": "Profile and Identity",
  "/faculty_skillacademy/profile": "Profile and Identity",
};

const FACULTY_BOOTCAMP_ROUTES: Record<string, string> = {
  "/faculty_bootcamp": "Profile and Identity",
  "/faculty_bootcamp_profile": "Profile and Identity",
  "/faculty_bootcamp/profile": "Profile and Identity",
};

const FACULTY_CORPORATE_ROUTES: Record<string, string> = {
  "/faculty_corporate": "Profile and Identity",
  "/faculty_corporate_profile": "Profile and Identity",
  "/faculty_corporate/profile": "Profile and Identity",
};

const FACULTY_GOVERNMENT_ROUTES: Record<string, string> = {
  "/faculty_government": "Profile and Identity",
  "/faculty_government_profile": "Profile and Identity",
  "/faculty_government/profile": "Profile and Identity",
};

const FACULTY_NGO_ROUTES: Record<string, string> = {
  "/faculty_ngo": "Profile and Identity",
  "/faculty_ngo_profile": "Profile and Identity",
  "/faculty_ngo/profile": "Profile and Identity",
};

const STUDENT_ROUTES: Record<string, string[]> = {
  "/student_profile": ["Student Profile", "Student Profile"],
  "/studentprofile": ["Student Profile", "Student Profile"],
  "/student_profile/profile": ["Student Profile", "Student Profile"],
  "/studentprofile/profile": ["Student Profile", "Student Profile"],
  "/student_profile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],
  "/studentprofile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],
  "/student_profile/registration": ["Student Profile", "Registration"],
  "/studentprofile/registration": ["Student Profile", "Registration"],
  "/student_registration": ["Student Profile", "Registration"],
  "/student_profile/consent": ["Student Profile", "Consent"],
  "/studentprofile/consent": ["Student Profile", "Consent"],
  "/student_consent": ["Student Profile", "Consent"],
};

export default function Header() {
  const pathname = usePathname();

  const [headerProfileImage, setHeaderProfileImage] =
    useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  // Assessment screens use the LMS header without profile breadcrumbs.
  const isMainLmsRoute =
    normalizedPath === "/dashboard" ||
    normalizedPath === "/assessments" ||
    normalizedPath.startsWith("/assessments/") ||
    normalizedPath === "/Assessment" ||
    normalizedPath.startsWith("/Assessment/") ||
    normalizedPath === "/MCQ" ||
    normalizedPath.startsWith("/MCQ/") ||
    normalizedPath === "/mcq_content" ||
    normalizedPath.startsWith("/mcq_content/") ||
    normalizedPath === "/mcq_evaluation" ||
    normalizedPath.startsWith("/mcq_evaluation/") ||
    normalizedPath === "/review" ||
    normalizedPath.startsWith("/review/");

  const isPlatformAdmin =
    normalizedPath.startsWith("/platform_admin") ||
    normalizedPath.startsWith("/platformadmin");

  const isInstitutionAdmin =
    normalizedPath.startsWith("/institution_admin") ||
    normalizedPath.startsWith("/institutionadmin");

  const isBootcamp =
    normalizedPath === "/coordinator_bootcamp" ||
    normalizedPath.startsWith("/coordinator_bootcamp/") ||
    normalizedPath === "/bootcamp" ||
    normalizedPath.startsWith("/bootcamp_") ||
    normalizedPath.startsWith("/bootcamp/");

  const isUniversity =
    normalizedPath === "/coordinator_university" ||
    normalizedPath.startsWith("/coordinator_university/") ||
    normalizedPath === "/university" ||
    normalizedPath.startsWith("/university_") ||
    normalizedPath.startsWith("/university/");

  const isCorporate =
    normalizedPath === "/coordinator_corporate" ||
    normalizedPath.startsWith("/coordinator_corporate/");

  const isCoordinatorGovernment =
    normalizedPath === "/coordinator_government" ||
    normalizedPath.startsWith("/coordinator_government/");

  const isNgo =
    normalizedPath === "/coordinator_ngo" ||
    normalizedPath.startsWith("/coordinator_ngo/");

  const isGovernment =
    isCoordinatorGovernment ||
    normalizedPath === "/government" ||
    normalizedPath.startsWith("/government_") ||
    normalizedPath.startsWith("/government/") ||
    normalizedPath.startsWith("/government_coordinator");

  const isStudentUniversity =
    normalizedPath === "/student_university" ||
    normalizedPath.startsWith("/student_university/") ||
    normalizedPath.startsWith("/student_university_");

  const isStudentBootcamp =
    normalizedPath === "/student_bootcamp" ||
    normalizedPath.startsWith("/student_bootcamp/") ||
    normalizedPath.startsWith("/student_bootcamp_");

  const isStudentSkillAcademy =
    normalizedPath === "/student_skillacademy" ||
    normalizedPath.startsWith("/student_skillacademy/") ||
    normalizedPath.startsWith("/student_skillacademy_");

  const isStudentCorporate =
    normalizedPath === "/student_corporate" ||
    normalizedPath.startsWith("/student_corporate/") ||
    normalizedPath.startsWith("/student_corporate_");

  const isStudentGovernment =
    normalizedPath === "/student_government" ||
    normalizedPath.startsWith("/student_government/") ||
    normalizedPath.startsWith("/student_government_");

  const isStudentNgo =
    normalizedPath === "/student_ngo" ||
    normalizedPath.startsWith("/student_ngo/") ||
    normalizedPath.startsWith("/student_ngo_");

  const isFacultyUniversity =
    normalizedPath === "/faculty_university" ||
    normalizedPath.startsWith("/faculty_university/") ||
    normalizedPath.startsWith("/faculty_university_");

  const isFacultySkillAcademy =
    normalizedPath === "/faculty_skillacademy" ||
    normalizedPath.startsWith("/faculty_skillacademy/") ||
    normalizedPath.startsWith("/faculty_skillacademy_");

  const isFacultyBootcamp =
    normalizedPath === "/faculty_bootcamp" ||
    normalizedPath.startsWith("/faculty_bootcamp/") ||
    normalizedPath.startsWith("/faculty_bootcamp_");

  const isFacultyCorporate =
    normalizedPath === "/faculty_corporate" ||
    normalizedPath.startsWith("/faculty_corporate/") ||
    normalizedPath.startsWith("/faculty_corporate_");

  const isFacultyGovernment =
    normalizedPath === "/faculty_government" ||
    normalizedPath.startsWith("/faculty_government/") ||
    normalizedPath.startsWith("/faculty_government_");

  const isFacultyNgo =
    normalizedPath === "/faculty_ngo" ||
    normalizedPath.startsWith("/faculty_ngo/") ||
    normalizedPath.startsWith("/faculty_ngo_");

  const isStudent =
    !isStudentUniversity &&
    !isStudentBootcamp &&
    !isStudentSkillAcademy &&
    !isStudentCorporate &&
    !isStudentGovernment &&
    !isStudentNgo &&
    (normalizedPath.startsWith("/student_profile") ||
      normalizedPath.startsWith("/studentprofile") ||
      normalizedPath.startsWith("/student_"));

  const isSuperAdmin =
    normalizedPath.startsWith("/super_admin") ||
    normalizedPath.startsWith("/superadmin");

  const profileStorageKey = isPlatformAdmin
    ? "platformAdminProfileImage"
    : isInstitutionAdmin
      ? "institutionAdminProfileImage"
      : isSuperAdmin
        ? "superAdminProfileImage"
        : isStudentUniversity
          ? "studentUniversityProfileImage"
          : isStudentBootcamp
            ? "studentBootcampProfileImage"
            : isStudentSkillAcademy
              ? "studentSkillAcademyProfileImage"
              : isStudentCorporate
                ? "studentCorporateProfileImage"
                : isStudentGovernment
                  ? "studentGovernmentProfileImage"
                  : isStudentNgo
                    ? "studentNgoProfileImage"
                    : isFacultyUniversity
                      ? "facultyUniversityProfileImage"
                      : isFacultySkillAcademy
                        ? "facultySkillAcademyProfileImage"
                        : isFacultyBootcamp
                          ? "facultyBootcampProfileImage"
                          : isFacultyCorporate
                            ? "facultyCorporateProfileImage"
                            : isFacultyGovernment
                              ? "facultyGovernmentProfileImage"
                              : isFacultyNgo
                                ? "facultyNgoProfileImage"
                                : isUniversity
                                  ? "universityCoordinatorProfileImage"
                                  : isBootcamp
                                    ? "bootcampCoordinatorProfileImage"
                                    : isCorporate
                                      ? "corporateCoordinatorProfileImage"
                                      : isGovernment
                                        ? "governmentCoordinatorProfileImage"
                                        : isNgo
                                          ? "ngoCoordinatorProfileImage"
                                          : isStudent
                                            ? "studentProfileImage"
                                            : null;

  // Do not use "Profile and Identity" as a fallback for unknown routes.
  const currentPage = isStudentUniversity
    ? STUDENT_UNIVERSITY_ROUTES[normalizedPath] ?? null
    : isStudentBootcamp
      ? STUDENT_BOOTCAMP_ROUTES[normalizedPath] ?? null
      : isStudentSkillAcademy
        ? STUDENT_SKILLACADEMY_ROUTES[normalizedPath] ?? null
        : isStudentCorporate
          ? STUDENT_CORPORATE_ROUTES[normalizedPath] ?? null
          : isStudentGovernment
            ? STUDENT_GOVERNMENT_ROUTES[normalizedPath] ?? null
            : isStudentNgo
              ? STUDENT_NGO_ROUTES[normalizedPath] ?? null
              : isFacultyUniversity
                ? FACULTY_UNIVERSITY_ROUTES[normalizedPath] ?? null
                : isFacultySkillAcademy
                  ? FACULTY_SKILLACADEMY_ROUTES[normalizedPath] ?? null
                  : isFacultyBootcamp
                    ? FACULTY_BOOTCAMP_ROUTES[normalizedPath] ?? null
                    : isFacultyCorporate
                      ? FACULTY_CORPORATE_ROUTES[normalizedPath] ?? null
                      : isFacultyGovernment
                        ? FACULTY_GOVERNMENT_ROUTES[normalizedPath] ?? null
                        : isFacultyNgo
                          ? FACULTY_NGO_ROUTES[normalizedPath] ?? null
                          : isCorporate
                            ? COORDINATOR_CORPORATE_ROUTES[normalizedPath] ?? null
                            : isNgo
                              ? COORDINATOR_NGO_ROUTES[normalizedPath] ?? null
                              : isCoordinatorGovernment
                                ? COORDINATOR_GOVERNMENT_ROUTES[normalizedPath] ?? null
                                : isGovernment
                                  ? GOVERNMENT_ROUTES[normalizedPath] ?? null
                                  : isUniversity
                                    ? UNIVERSITY_ROUTES[normalizedPath] ?? null
                                    : isBootcamp
                                      ? COORDINATOR_BOOTCAMP_ROUTES[normalizedPath] ??
                                        BOOTCAMP_ROUTES[normalizedPath] ??
                                        null
                                      : isInstitutionAdmin
                                        ? INSTITUTION_ADMIN_ROUTES[normalizedPath] ?? null
                                        : isPlatformAdmin
                                          ? PLATFORM_ADMIN_ROUTES[normalizedPath] ?? null
                                          : SUPER_ADMIN_ROUTES[normalizedPath] ?? null;

  const profileTitle = isStudentUniversity
    ? "University/ College Student Profile"
    : isStudentBootcamp
      ? "Bootcamp Learner Profile"
      : isStudentSkillAcademy
        ? "Skill academy Learner Profile"
        : isStudentCorporate
          ? "Corporate Trainee Profile"
          : isStudentGovernment
            ? "Government Trainee Profile"
            : isStudentNgo
              ? "NGO Trainee Profile"
              : isFacultyUniversity
                ? "University/ College Faculty Profile"
                : isFacultySkillAcademy
                  ? "Skill Academy Faculty Profile"
                  : isFacultyBootcamp
                    ? "Bootcamp Faculty Profile"
                    : isFacultyCorporate
                      ? "Corporate Faculty Profile"
                      : isFacultyGovernment
                        ? "Government Faculty Profile"
                        : isFacultyNgo
                          ? "NGO Faculty Profile"
                          : isCorporate
                            ? "Corporate Coordinator Profile"
                            : isNgo
                              ? "NGO Coordinator Profile"
                              : isGovernment
                                ? "Government Coordinator Profile"
                                : isUniversity
                                  ? "University/ College Coordinator Profile"
                                  : isBootcamp
                                    ? "Bootcamp Coordinator Profile"
                                    : isInstitutionAdmin
                                      ? "Institution admin Profile"
                                      : isPlatformAdmin
                                        ? "Platform admin Profile"
                                        : "Super admin Profile";

  const userName = isMainLmsRoute
    ? "Antony Thomas"
    : isStudentUniversity
      ? "Antony Thomas"
      : isStudentBootcamp
        ? "Antony Thomas"
        : isStudentSkillAcademy
          ? "Antony Thomas"
          : isStudentCorporate
            ? "Antony Thomas"
            : isStudentGovernment
              ? "Antony Thomas"
              : isStudentNgo
                ? "Antony Thomas"
                : isFacultyUniversity
                  ? "Antony Thomas"
                  : isFacultySkillAcademy
                    ? "Antony Thomas"
                    : isFacultyBootcamp
                      ? "Antony Thomas"
                      : isFacultyCorporate
                        ? "Antony Thomas"
                        : isFacultyGovernment
                          ? "Antony Thomas"
                          : isFacultyNgo
                            ? "Antony Thomas"
                            : isCorporate
                              ? "Antony Thomas"
                              : isNgo
                                ? "Antony Thomas"
                                : isGovernment
                                  ? "Antony Thomas"
                                  : isUniversity
                                    ? "Antony Thomas"
                                    : isBootcamp
                                      ? "Antony Thomas"
                                      : isInstitutionAdmin
                                        ? "Antony Thomas"
                                        : isPlatformAdmin
                                          ? "Suresh Kumar"
                                          : isStudent
                                            ? "Student"
                                            : "Rajesh Mehta";

  const userRole = isMainLmsRoute
    ? "Institution admin"
    : isStudentUniversity
      ? "University Student"
      : isStudentBootcamp
        ? "Bootcamp Learner"
        : isStudentSkillAcademy
          ? "Skill academy Student"
          : isStudentCorporate
            ? "Corporate Trainee"
            : isStudentGovernment
              ? "Government Trainee"
              : isStudentNgo
                ? "NGO Trainee"
                : isFacultyUniversity
                  ? "University/ College Faculty"
                  : isFacultySkillAcademy
                    ? "Skill Academy Faculty"
                    : isFacultyBootcamp
                      ? "Bootcamp Faculty"
                      : isFacultyCorporate
                        ? "Corporate Faculty"
                        : isFacultyGovernment
                          ? "Government Faculty"
                          : isFacultyNgo
                            ? "NGO Faculty"
                            : isCorporate
                              ? "Corporate Coordinator"
                              : isNgo
                                ? "NGO Coordinator"
                                : isGovernment
                                  ? "Government Coordinator"
                                  : isUniversity
                                    ? "University Coordinator"
                                    : isBootcamp
                                      ? "Bootcamp Coordinator"
                                      : isInstitutionAdmin
                                        ? "Institution admin"
                                        : isPlatformAdmin
                                          ? "Platform admin"
                                          : isStudent
                                            ? "Student"
                                            : "Super admin";

  // Retained for the original role-specific asset behavior on the right.
  const notificationIcon = isCorporate
    ? "/assets/superadminicons/notification.svg"
    : isNgo
      ? "/assets/superadminicons/notification.svg"
      : isGovernment
        ? "/assets/superadminicons/notification.svg"
        : isBootcamp
          ? "/assets/superadminicons/notification.svg"
          : isUniversity
            ? "/assets/superadminicons/notification.svg"
            : isPlatformAdmin
              ? "/assets/platformadmin.imagesandicons/notification.svg"
              : "/assets/superadminicons/notification.svg";

  const profileImage = isMainLmsRoute
    ? "/assets/assessments/antony-avatar.png"
    : isStudentUniversity
      ? headerProfileImage || "/assets/studenticons/profile.png"
      : isStudentBootcamp
        ? headerProfileImage || "/assets/studenticons/profile.png"
        : isStudentSkillAcademy
          ? headerProfileImage || "/assets/studenticons/profile.png"
          : isStudentCorporate
            ? headerProfileImage || "/assets/studenticons/profile.png"
            : isStudentGovernment
              ? headerProfileImage || "/assets/studenticons/profile.png"
              : isStudentNgo
                ? headerProfileImage || "/assets/studenticons/profile.png"
                : isFacultyUniversity
                  ? headerProfileImage || "/assets/funiversityimages/profile.png"
                  : isFacultySkillAcademy
                    ? headerProfileImage || "/assets/funiversityimages/profile.png"
                    : isFacultyBootcamp
                      ? headerProfileImage || "/assets/funiversityimages/profile.png"
                      : isFacultyCorporate
                        ? headerProfileImage || "/assets/funiversityimages/profile.png"
                        : isFacultyGovernment
                          ? headerProfileImage || "/assets/funiversityimages/profile.png"
                          : isFacultyNgo
                            ? headerProfileImage || "/assets/funiversityimages/profile.png"
                            : isCorporate
                              ? headerProfileImage || "/assets/institutionimages/profile.png"
                              : isNgo
                                ? headerProfileImage || "/assets/institutionimages/profile.png"
                                : isGovernment
                                  ? headerProfileImage || "/assets/institutionimages/profile.png"
                                  : isUniversity
                                    ? headerProfileImage || "/assets/institutionimages/profile.png"
                                    : isBootcamp
                                      ? headerProfileImage || "/assets/institutionimages/profile.png"
                                      : isInstitutionAdmin
                                        ? headerProfileImage || "/assets/institutionimages/profile.png"
                                        : isPlatformAdmin
                                          ? headerProfileImage || "/assets/platformadmin.imagesandicons/profile.png"
                                          : isSuperAdmin
                                            ? headerProfileImage || "/assets/superadminimages/profile.png"
                                            : isStudent
                                              ? headerProfileImage || "/assets/studenticons/profile.png"
                                              : "/assets/superadminimages/profile.png";

  useEffect(() => {
    if (!profileStorageKey) {
      setHeaderProfileImage(null);
      return;
    }

    const readSavedHeaderProfileImage = () => {
      try {
        return (
          localStorage.getItem(profileStorageKey) ||
          sessionStorage.getItem(profileStorageKey)
        );
      } catch {
        return null;
      }
    };

    setHeaderProfileImage(readSavedHeaderProfileImage());

    const handleProfileImageUpdated = (event: Event) => {
      if (event instanceof CustomEvent) {
        const detail = event.detail as
          | {
              storageKey?: string;
              image?: string;
            }
          | undefined;

        if (
          detail?.storageKey === profileStorageKey &&
          typeof detail.image === "string" &&
          detail.image
        ) {
          setHeaderProfileImage(detail.image);
          return;
        }
      }

      const savedImage = readSavedHeaderProfileImage();

      if (savedImage) {
        setHeaderProfileImage(savedImage);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== profileStorageKey) return;
      setHeaderProfileImage(event.newValue);
    };

    window.addEventListener(
      "profileImageUpdated",
      handleProfileImageUpdated
    );
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        handleProfileImageUpdated
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [profileStorageKey]);

  useEffect(() => {
    const isCoordinatorPage =
      isSuperAdmin ||
      isPlatformAdmin ||
      isInstitutionAdmin ||
      isStudent ||
      isStudentUniversity ||
      isStudentBootcamp ||
      isStudentSkillAcademy ||
      isStudentCorporate ||
      isStudentGovernment ||
      isStudentNgo ||
      isFacultyUniversity ||
      isFacultySkillAcademy ||
      isFacultyBootcamp ||
      isFacultyCorporate ||
      isFacultyGovernment ||
      isFacultyNgo ||
      isUniversity ||
      isBootcamp ||
      isCorporate ||
      isGovernment ||
      isNgo;

    if (!isCoordinatorPage || !profileStorageKey) return;

    const handleCoordinatorProfileUpload = (event: Event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) return;

      const isProfileImageInput =
        input.classList.contains("institutionProfileImageInput") ||
        input.classList.contains("profileImageInput") ||
        input.name === "profileImage" ||
        input.getAttribute("aria-label")?.toLowerCase().includes("profile image");

      if (input.type !== "file" || !isProfileImageInput) return;

      const file = input.files?.[0];

      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") return;

        const uploadedProfileImage = reader.result;

        setHeaderProfileImage(uploadedProfileImage);

        try {
          localStorage.setItem(
            profileStorageKey,
            uploadedProfileImage
          );
        } catch {
          try {
            sessionStorage.setItem(
              profileStorageKey,
              uploadedProfileImage
            );
          } catch {
            // Keep the image in the current header state.
          }
        }

        window.dispatchEvent(
          new CustomEvent("profileImageUpdated", {
            detail: {
              storageKey: profileStorageKey,
              image: uploadedProfileImage,
            },
          })
        );
      };

      reader.readAsDataURL(file);
    };

    document.addEventListener(
      "change",
      handleCoordinatorProfileUpload,
      true
    );

    return () => {
      document.removeEventListener(
        "change",
        handleCoordinatorProfileUpload,
        true
      );
    };
  }, [
    isSuperAdmin,
    isPlatformAdmin,
    isInstitutionAdmin,
    isStudent,
    isStudentUniversity,
    isStudentBootcamp,
    isStudentSkillAcademy,
    isStudentCorporate,
    isStudentGovernment,
    isStudentNgo,
    isFacultyUniversity,
    isFacultySkillAcademy,
    isFacultyBootcamp,
    isFacultyCorporate,
    isFacultyGovernment,
    isFacultyNgo,
    isUniversity,
    isBootcamp,
    isCorporate,
    isGovernment,
    isNgo,
    profileStorageKey,
  ]);

  useEffect(() => {
    document.body.classList.toggle(
      "mobileSidebarOpen",
      isMobileMenuOpen
    );

    return () => {
      document.body.classList.remove("mobileSidebarOpen");
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const studentBreadcrumb =
    STUDENT_ROUTES[normalizedPath] ??
    (() => {
      if (normalizedPath.includes("consent")) {
        return ["Student Profile", "Consent"];
      }

      if (normalizedPath.includes("registration")) {
        return ["Student Profile", "Registration"];
      }

      return null;
    })();

  // Left side only: no default breadcrumb on unmapped routes.
  const breadcrumbContent = isMainLmsRoute
    ? null
    : isStudent
      ? studentBreadcrumb
        ? (
            <>
              {studentBreadcrumb.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="breadcrumbSegment"
                >
                  {index > 0 && (
                    <ChevronRight size={15} aria-hidden="true" />
                  )}

                  <span
                    className={
                      index === studentBreadcrumb.length - 1
                        ? "breadcrumbCurrent"
                        : "breadcrumbParent"
                    }
                  >
                    {item}
                  </span>
                </span>
              ))}
            </>
          )
        : null
      : currentPage
        ? (
            <>
              <span className="breadcrumbParent">{profileTitle}</span>
              <ChevronRight size={15} aria-hidden="true" />
              <span className="breadcrumbCurrent">{currentPage}</span>
            </>
          )
        : null;

  return (
    <>
      <header className="topHeader">
        <div className="breadcrumb desktopBreadcrumb">
          {breadcrumbContent}
        </div>

        {/* Right-hand side kept as in your original component. */}
        <div className="headerRight">
          <button
            type="button"
            className="notificationButton"
            aria-label="Notifications"
          >
            {isMainLmsRoute ? (
              <Bell
                size={19}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            ) : (
              <Image
                src={notificationIcon}
                alt=""
                width={18}
                height={18}
              />
            )}

            <span
              className="notificationDot"
              aria-hidden="true"
            />
          </button>

          <div className="headerDivider" />

          <div className="topUserProfile">
            <div className="smallAvatar">
              <span className="avatarFallback" aria-hidden="true">
                AT
              </span>

              <Image
                src={profileImage}
                alt=""
                fill
                sizes="40px"
                className="avatarImage"
                unoptimized={profileImage.startsWith("data:")}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </div>

            <div className="topUserDetails">
              <h1 className="topUserName">{userName}</h1>
              <div className="topUserRole">{userRole}</div>
            </div>
          </div>

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen((current) => !current)
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {!isMainLmsRoute && breadcrumbContent && (
        <div className="breadcrumb mobileBreadcrumb">
          {breadcrumbContent}
        </div>
      )}
    </>
  );
}
