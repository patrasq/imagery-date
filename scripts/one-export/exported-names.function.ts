import ts from 'typescript';
import { ONE_EXPORT_MESSAGES as M } from './one-export-messages.constants.ts';

type NamedStatement =
  | ts.ClassDeclaration
  | ts.FunctionDeclaration
  | ts.InterfaceDeclaration
  | ts.TypeAliasDeclaration
  | ts.EnumDeclaration
  | ts.ModuleDeclaration;

const NAMED_STATEMENT_GUARDS: readonly ((node: ts.Node) => boolean)[] = [
  ts.isClassDeclaration,
  ts.isFunctionDeclaration,
  ts.isInterfaceDeclaration,
  ts.isTypeAliasDeclaration,
  ts.isEnumDeclaration,
  ts.isModuleDeclaration,
];

const isNamedStatement = (node: ts.Statement): node is NamedStatement =>
  NAMED_STATEMENT_GUARDS.some((guard) => guard(node));

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);

function declarationNames(statement: ts.Statement): string[] {
  if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) return [M.defaultExport];
  if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.map((d) => d.name.getText());
  return isNamedStatement(statement) && statement.name ? [statement.name.text] : [];
}

function exportClauseNames(statement: ts.ExportDeclaration): string[] {
  const clause = statement.exportClause;
  if (!clause) return [M.starExport];
  return ts.isNamedExports(clause) ? clause.elements.map((e) => e.name.text) : [clause.name.text];
}

/**
 * Every name a module exports: declarations, export lists, `export *` and default exports. A type and a value of the
 * same name (a branded ID and its codec) are one symbol.
 */
export function exportedNames(fileName: string, source: string): string[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const names = file.statements.flatMap((statement) => {
    if (ts.isExportDeclaration(statement)) return exportClauseNames(statement);
    if (ts.isExportAssignment(statement)) return [M.defaultExport];
    return hasModifier(statement, ts.SyntaxKind.ExportKeyword) ? declarationNames(statement) : [];
  });
  return [...new Set(names)];
}
