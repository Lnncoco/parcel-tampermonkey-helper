import {
  CallExpression,
  Expression,
  transformSync,
  VariableDeclarator,
} from "@swc/core";
import { Visitor } from "@swc/core/Visitor.js";

/**
 * SWC - GM前缀函数提取插件
 */
class ExtractFunc extends Visitor {
  private data: Set<string>;
  constructor(data: Set<string>) {
    super();
    this.data = data;
  }
  visitVariableDeclarator(n: VariableDeclarator): VariableDeclarator {
    if (n.id.type === "Identifier" && n.id.value === "HMR_HOST") {
      n.init = {
        type: "StringLiteral",
        value: "localhost",
        span: n.span,
        hasEscape: false,
        // kind: {
        //   type: "normal",
        //   containsQuote: true,
        // },
      };
    }
    return n;
  }
  visitCallExpression(n: CallExpression): Expression {
    n.callee = this.visitCallee(n.callee);
    n.typeArguments = this.visitTsTypeParameterInstantiation(n.typeArguments);
    if (n.arguments) {
      n.arguments = this.visitArguments(n.arguments);
    }

    let target = n.callee;
    let callName = "";
    if (n.callee.type === "MemberExpression") {
      target = n.callee.object;
      if (n.callee.property.type === "Identifier") {
        callName = n.callee.property.value;
      }
    }
    if (target.type !== "Identifier") return n;

    const funcName = target.value;
    const reg = /GM_|unsafeWindow/;
    if (reg.test(funcName)) this.data.add(funcName);
    // if (/window/.test(funcName)) this.data.add(`window.${callName}`); // 用于记录window调用

    return n;
  }
}

/**
 * SWC - GM函数提取
 * @param code 源码文本
 */
export const parser = (code: string) => {
  const data = new Set<string>();
  transformSync(code, {
    plugin: (m) => new ExtractFunc(data).visitProgram(m),
  });
  return data;
};
