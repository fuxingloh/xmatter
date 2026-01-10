export default ({ theme }: any) => ({
  DEFAULT: {
    css: {
      "--tw-prose-body": theme("colors.mono.400 / 1"),
      "--tw-prose-headings": theme("colors.mono.100 / 1"),
      "--tw-prose-links": theme("colors.blue.500 / 1"),
      "--tw-prose-links-hover": theme("colors.blue.500 / 1"),
      "--tw-prose-links-underline": theme("colors.blue.500 / 0.25"),
      "--tw-prose-bold": theme("colors.mono.100 / 1"),
      "--tw-prose-counters": theme("colors.mono.400 / 1"),
      "--tw-prose-bullets": theme("colors.mono.600 / 1"),
      "--tw-prose-hr": theme("colors.mono.100 / 0.05"),
      "--tw-prose-quotes": theme("colors.mono.100 / 1"),
      "--tw-prose-quote-borders": theme("colors.mono.700 / 1"),
      "--tw-prose-captions": theme("colors.mono.400 / 1"),
      "--tw-prose-code": theme("colors.mono.100 / 1"),
      "--tw-prose-code-bg": theme("colors.mono.700 / 0.15"),
      "--tw-prose-code-ring": theme("colors.mono.100 / 0.1"),
      "--tw-prose-th-borders": theme("colors.mono.600 / 1"),
      "--tw-prose-td-borders": theme("colors.mono.700 / 1"),

      // Base
      color: "var(--tw-prose-body)",
      fontSize: theme("fontSize.base")[0],
      lineHeight: theme("lineHeight.7"),
      wordWrap: "break-word",

      // Text
      p: {
        marginTop: theme("spacing.4"),
        marginBottom: theme("spacing.4"),
      },
      '[class~="lead"]': {
        fontSize: theme("fontSize.lg")[0],
        ...theme("fontSize.base")[1],
      },

      // Lists
      ol: {
        listStyleType: "decimal",
        marginTop: theme("spacing.4"),
        marginBottom: theme("spacing.4"),
        paddingLeft: "1.625rem",
      },
      'ol[type="A"]': {
        listStyleType: "upper-alpha",
      },
      'ol[type="a"]': {
        listStyleType: "lower-alpha",
      },
      'ol[type="A" s]': {
        listStyleType: "upper-alpha",
      },
      'ol[type="a" s]': {
        listStyleType: "lower-alpha",
      },
      'ol[type="I"]': {
        listStyleType: "upper-roman",
      },
      'ol[type="i"]': {
        listStyleType: "lower-roman",
      },
      'ol[type="I" s]': {
        listStyleType: "upper-roman",
      },
      'ol[type="i" s]': {
        listStyleType: "lower-roman",
      },
      'ol[type="1"]': {
        listStyleType: "decimal",
      },
      ul: {
        listStyleType: "disc",
        marginTop: theme("spacing.4"),
        marginBottom: theme("spacing.4"),
        paddingLeft: "1.625rem",
      },
      li: {
        marginTop: theme("spacing.2"),
        marginBottom: theme("spacing.2"),
      },
      ":is(ol, ul) > li": {
        paddingLeft: theme("spacing[1.5]"),
      },
      "ol > li::marker": {
        fontWeight: "400",
        color: "var(--tw-prose-counters)",
      },
      "ul > li::marker": {
        color: "var(--tw-prose-bullets)",
      },
      "> ul > li p": {
        marginTop: theme("spacing.3"),
        marginBottom: theme("spacing.3"),
      },
      "> ul > li > *:first-child": {
        marginTop: theme("spacing.5"),
      },
      "> ul > li > *:last-child": {
        marginBottom: theme("spacing.5"),
      },
      "> ol > li > *:first-child": {
        marginTop: theme("spacing.5"),
      },
      "> ol > li > *:last-child": {
        marginBottom: theme("spacing.5"),
      },
      "ul ul, ul ol, ol ul, ol ol": {
        marginTop: theme("spacing.3"),
        marginBottom: theme("spacing.3"),
      },

      // Horizontal rules
      hr: {
        borderColor: "var(--tw-prose-hr)",
        borderTopWidth: 1,
        marginTop: theme("spacing.16"),
        marginBottom: theme("spacing.16"),
        maxWidth: "none",
        marginLeft: `calc(-1 * ${theme("spacing.4")})`,
        marginRight: `calc(-1 * ${theme("spacing.4")})`,
        "@screen sm": {
          marginLeft: `calc(-1 * ${theme("spacing.6")})`,
          marginRight: `calc(-1 * ${theme("spacing.6")})`,
        },
        "@screen lg": {
          marginLeft: `calc(-1 * ${theme("spacing.8")})`,
          marginRight: `calc(-1 * ${theme("spacing.8")})`,
        },
      },

      // Quotes
      blockquote: {
        fontWeight: "500",
        fontStyle: "italic",
        color: "var(--tw-prose-quotes)",
        borderLeftWidth: "0.25rem",
        borderLeftColor: "var(--tw-prose-quote-borders)",
        quotes: '"\\201C""\\201D""\\2018""\\2019"',
        marginTop: theme("spacing.8"),
        marginBottom: theme("spacing.8"),
        paddingLeft: theme("spacing.5"),
      },
      "blockquote p:first-of-type::before": {
        content: "open-quote",
      },
      "blockquote p:last-of-type::after": {
        content: "close-quote",
      },

      // Headings
      h1: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
        fontSize: theme("fontSize.2xl")[0],
        ...theme("fontSize.2xl")[1],
        marginBottom: theme("spacing.4"),
      },
      h2: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
        fontSize: theme("fontSize.xl")[0],
        ...theme("fontSize.lg")[1],
        marginTop: theme("spacing.16"),
        marginBottom: theme("spacing.2"),
      },
      h3: {
        color: "var(--tw-prose-headings)",
        fontSize: theme("fontSize.lg")[0],
        ...theme("fontSize.base")[1],
        fontWeight: "700",
        marginTop: theme("spacing.10"),
        marginBottom: theme("spacing.2"),
      },
      h4: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
        marginTop: theme("spacing.2"),
        marginBottom: theme("spacing.2"),
      },
      h5: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
        marginTop: theme("spacing.2"),
        marginBottom: theme("spacing.2"),
      },
      h6: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
        marginTop: theme("spacing.2"),
        marginBottom: theme("spacing.2"),
      },
      // Media
      "img, video, figure": {
        marginTop: theme("spacing.8"),
        marginBottom: theme("spacing.8"),
      },
      "figure > *": {
        marginTop: "0",
        marginBottom: "0",
      },
      figcaption: {
        color: "var(--tw-prose-captions)",
        fontSize: theme("fontSize.sm")[0],
        ...theme("fontSize.xs")[1],
        marginTop: theme("spacing.2"),
      },

      // Tables
      table: {
        width: "100%",
        tableLayout: "auto",
        textAlign: "left",
        marginTop: theme("spacing.8"),
        marginBottom: theme("spacing.8"),
        lineHeight: theme("lineHeight.6"),
        display: "block",
        overflowX: "auto",
      },
      thead: {
        borderBottomWidth: "1px",
        borderBottomColor: "var(--tw-prose-th-borders)",
      },
      "thead th": {
        color: "var(--tw-prose-headings)",
        fontWeight: "600",
        verticalAlign: "bottom",
        paddingRight: theme("spacing.3"),
        paddingBottom: theme("spacing.2"),
        paddingLeft: theme("spacing.3"),
      },
      "thead th:first-child": {
        paddingLeft: "0",
      },
      "thead th:last-child": {
        paddingRight: "0",
      },
      "tbody tr": {
        borderBottomWidth: "1px",
        borderBottomColor: "var(--tw-prose-td-borders)",
      },
      "tbody tr:last-child": {
        borderBottomWidth: "0",
      },
      "tbody td": {
        verticalAlign: "baseline",
      },
      tfoot: {
        borderTopWidth: "1px",
        borderTopColor: "var(--tw-prose-th-borders)",
      },
      "tfoot td": {
        verticalAlign: "top",
      },
      ":is(tbody, tfoot) td": {
        paddingTop: theme("spacing.2"),
        paddingRight: theme("spacing.3"),
        paddingBottom: theme("spacing.2"),
        paddingLeft: theme("spacing.3"),
      },
      ":is(tbody, tfoot) td:first-child": {
        paddingLeft: "0",
      },
      ":is(tbody, tfoot) td:last-child": {
        paddingRight: "0",
      },

      // Inline elements
      a: {
        color: "var(--tw-prose-links)",
        textDecoration: "underline transparent",
        fontWeight: "500",
        transitionProperty: "color, text-decoration-color",
        transitionDuration: theme("transitionDuration.DEFAULT"),
        transitionTimingFunction: theme("transitionTimingFunction.DEFAULT"),
        "&:hover": {
          color: "var(--tw-prose-links-hover)",
          textDecorationColor: "var(--tw-prose-links-underline)",
        },
      },
      ":is(h1, h2, h3) a": {
        fontWeight: "inherit",
      },
      strong: {
        color: "var(--tw-prose-bold)",
        fontWeight: "600",
      },
      ":is(a, blockquote, thead th) strong": {
        color: "inherit",
      },
      "code:not(pre code)": {
        color: "var(--tw-prose-code)",
        borderRadius: theme("borderRadius.lg"),
        paddingTop: theme("padding.1"),
        paddingRight: theme("padding[1.5]"),
        paddingBottom: theme("padding.1"),
        paddingLeft: theme("padding[1.5]"),
        boxShadow: "inset 0 0 0 1px var(--tw-prose-code-ring)",
        backgroundColor: "var(--tw-prose-code-bg)",
        fontSize: theme("fontSize.xs"),
      },
      ":is(a, h1, h2, h3, blockquote, thead th) code": {
        color: "inherit",
      },
      "h2 code": {
        fontSize: theme("fontSize.lg")[0],
        fontWeight: "inherit",
      },
      "h3 code": {
        fontSize: theme("fontSize.base")[0],
        fontWeight: "inherit",
      },

      // Overrides
      ":is(h1, h2, h3) + *": {
        marginTop: "0",
      },
      "> :nth-child(2)": {
        marginTop: "0 !important",
      },
      "> :last-child": {
        marginBottom: "0 !important",
      },
    },
  },
});
