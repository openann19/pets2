import type { HTMLMotionProps, SVGMotionProps } from "framer-motion";

declare global {
  type MotionDivProps = HTMLMotionProps<"div">;
  type MotionSpanProps = HTMLMotionProps<"span">;
  type MotionButtonProps = HTMLMotionProps<"button">;
  type MotionSvgProps = SVGMotionProps<SVGSVGElement>;
  type MotionSectionProps = HTMLMotionProps<"section">;
  type MotionArticleProps = HTMLMotionProps<"article">;
  type MotionHeaderProps = HTMLMotionProps<"header">;
  type MotionFooterProps = HTMLMotionProps<"footer">;
  type MotionNavProps = HTMLMotionProps<"nav">;
  type MotionMainProps = HTMLMotionProps<"main">;
  type MotionAsideProps = HTMLMotionProps<"aside">;
  type MotionFormProps = HTMLMotionProps<"form">;
  type MotionInputProps = HTMLMotionProps<"input">;
  type MotionTextareaProps = HTMLMotionProps<"textarea">;
  type MotionSelectProps = HTMLMotionProps<"select">;
  type MotionLabelProps = HTMLMotionProps<"label">;
  type MotionPProps = HTMLMotionProps<"p">;
  type MotionH1Props = HTMLMotionProps<"h1">;
  type MotionH2Props = HTMLMotionProps<"h2">;
  type MotionH3Props = HTMLMotionProps<"h3">;
  type MotionH4Props = HTMLMotionProps<"h4">;
  type MotionH5Props = HTMLMotionProps<"h5">;
  type MotionH6Props = HTMLMotionProps<"h6">;
  type MotionUlProps = HTMLMotionProps<"ul">;
  type MotionOlProps = HTMLMotionProps<"ol">;
  type MotionLiProps = HTMLMotionProps<"li">;
  type MotionAProps = HTMLMotionProps<"a">;
  type MotionImgProps = HTMLMotionProps<"img">;
  type MotionVideoProps = HTMLMotionProps<"video">;
  type MotionCanvasProps = HTMLMotionProps<"canvas">;
  type MotionTableProps = HTMLMotionProps<"table">;
  type MotionTrProps = HTMLMotionProps<"tr">;
  type MotionTdProps = HTMLMotionProps<"td">;
  type MotionThProps = HTMLMotionProps<"th">;
  type MotionTbodyProps = HTMLMotionProps<"tbody">;
  type MotionTheadProps = HTMLMotionProps<"thead">;
  type MotionTfootProps = HTMLMotionProps<"tfoot">;
}

export {};
