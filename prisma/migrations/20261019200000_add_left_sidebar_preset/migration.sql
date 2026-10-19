-- Seed the "Left sidebar" preset template (keep in sync with config/templates.ts)
INSERT INTO `Template` (`id`, `name`, `description`, `layout`, `isSystem`, `updatedAt`) VALUES
('tpl_left_sidebar', 'Left sidebar', 'Header and footer across the top and bottom, a sidebar on the left, content beside it.',
 '{"columns":["240px","1fr"],"rows":["auto","1fr","auto"],"areas":[["header","header"],["sidebar","main"],["footer","footer"]],"contentWidth":"full","slots":{"header":{"kind":"HEADER"},"sidebar":{"kind":"GENERAL"},"footer":{"kind":"FOOTER"}}}',
 true, CURRENT_TIMESTAMP(3));
