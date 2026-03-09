import { cookies } from "next/headers";
import { getTenant } from "@/lib/getTenant";
import HeroSection from "./components/landing/HeroSection";
import StatsSection from "./components/landing/StatsSection";
import SuggestedCourses from "./components/landing/SuggestedCourses";
import YearsSection from "./components/landing/YearsSection";

async function getStages(slug) {
  try {
    const res = await fetch(
      `http://127.0.0.1:3001/api/v1/stages?slug=${slug}`,
      { cache: "no-store" }, // Bypass cache to get fresh DB data
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error(`Failed to fetch stages for tenant: ${slug}`, error);
    return [];
  }
}

async function getStageCourses(slug, stageId) {
  try {
    const res = await fetch(
      `http://127.0.0.1:3001/api/v1/courses?slug=${slug}&educational_stage_id=${stageId}&status=active`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error(`Failed to fetch stage courses for stage ${stageId}`, error);
    return [];
  }
}

async function getRandomCoursesForStages(slug, stages) {
  try {
    if (!stages || stages.length === 0) return [];

    const coursesPromises = stages.map((stage) =>
      getStageCourses(slug, stage.id),
    );
    const allStageCoursesArrays = await Promise.all(coursesPromises);
    const allCourses = allStageCoursesArrays.flat();

    const mappedCourses = allCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image_path
        ? course.image_path.startsWith("http")
          ? course.image_path
          : course.full_image_url
        : "/placeholder.png",
      price: course.price,
      startDate: "متاح الآن",
      endDate: "غير محدد",
      isPinned: course.order_index === 1,
    }));

    const uniqueCourses = Array.from(
      new Map(mappedCourses.map((item) => [item.id, item])).values(),
    );
    const shuffled = uniqueCourses.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, 8);
  } catch (error) {
    console.error("Failed to get random courses", error);
    return [];
  }
}

export default async function Page({ params }) {
  const { domain } = await params;

  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    return null;
  }

  const theme = layoutData.data.theme || {};

  // Check if student is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("student_token")?.value;

  let student = null;
  if (token) {
    try {
      const res = await fetch(
        `http://127.0.0.1:3001/api/v1/student/me?slug=${domain}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      if (res.ok) {
        student = await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch student data server-side:", e);
    }
  }

  // If student is logged in, show personalized homepage
  if (student && student.educational_stage_id) {
    const stageCourses = await getStageCourses(
      domain,
      student.educational_stage_id,
    );

    const mappedStudentCourses = stageCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image_path
        ? course.image_path.startsWith("http")
          ? course.image_path
          : course.full_image_url
        : "/placeholder.png",
      price: course.price,
      startDate: "متاح الآن",
      endDate: "غير محدد",
      isPinned: course.order_index === 1,
    }));

    // Filter out enrolled courses from the list so they just see available courses for their stage,
    // or we can pass all of them. The panel already handles the split.
    // Here we can just show them all, because the requirement: "وهنجيب تحت كل الكورسات الي بنفس المراحله الدراسيه للطالب"
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]" dir="rtl">
        <HeroSection theme={theme} studentName={student.name} />
        {mappedStudentCourses.length > 0 && (
          <SuggestedCourses
            theme={theme}
            courses={mappedStudentCourses}
            title={
              <>
                كورسات
                <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">
                  {" "}
                  مرحلتك الدراسية
                </span>
              </>
            }
            subtitle="اخترنا لك أفضل الكورسات اللي تناسب مرحلتك الدراسية عشان تبدأ رحلة تفوقك."
          />
        )}
      </div>
    );
  }

  // Fetch stages dynamically using the slug (domain) (Default behavior)
  const stages = await getStages(domain);
  const randomCourses = await getRandomCoursesForStages(domain, stages);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]" dir="rtl">
      <HeroSection theme={theme} />
      <StatsSection theme={theme} />
      {randomCourses.length > 0 && (
        <SuggestedCourses theme={theme} courses={randomCourses} />
      )}
      <YearsSection theme={theme} stages={stages} />
    </div>
  );
}
