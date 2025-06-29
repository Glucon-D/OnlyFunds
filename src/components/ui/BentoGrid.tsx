import { cn } from "@/lib/utils/cn";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  id,
  img,
  imgClassName,
  titleClassName
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  id: number,
  img?: String,
  imgClassName?: String
  titleClassName?: String
}) => {
  return (
    <div
      className={cn(
        "relative group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-3xl border bg-white p-4 transition duration-200 hover:shadow-xl dark:border-emerald/[0.2] dark:bg-black dark:shadow-none border-emerald-600 hover:border-[var(--primary-hover)]",
        className,
      )}
      style={{
        background: "#1E293B",
        backgroundColor: "radial-gradient(circle, rgba(30, 41, 59, 1) 0%, rgba(51, 65, 85, 1) 100%);"
      }}
    >
      <div className={`${id === 6} && flex justify-center h-full`}>
        <div className="w-full h-full absolute">

        </div>
      </div>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};
