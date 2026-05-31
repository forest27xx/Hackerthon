# 5.33 小票模块交接文档

更新时间：2026-05-31

## 1. 本分支定位

`5.33` 是在 `5.32` 整合版基础上加入的第三部分：最终小票展示。

用户完成第一关点单和第二关配送选择后，系统会根据生成的吃商人格，在结果页优先展示一张“快乐下单事务所”小票。小票内容来自真实购物车、优惠券、神券膨胀、下单时间和配送选择结果，不再是静态示例图。

## 2. 主要入口

```text
modules/frontend/src/App.tsx
  负责把点单数据、优惠券数据、真实下单时间、配送选择和最终人格传给小票组件。

modules/frontend/src/components/FinalPersonaReceipt.tsx
  新增的小票组件，负责四类小票样式、左右滑动切换、菜品明细、金额明细和条形码区域。

modules/frontend/src/styles.css
  新增 final-persona-receipt / final-receipt-* / receipt-style-switcher 相关样式。
```

## 3. 展示时机

结果页 `stage === "result"` 时展示：

```tsx
<FinalPersonaReceipt
  entries={cart}
  totals={totals}
  combos={combos}
  couponDiscount={couponDiscount}
  baseCouponDiscount={baseCouponDiscount}
  couponBoostDiscount={couponBoostDiscount}
  selectedCouponLabel={selectedCoupon?.label}
  payablePrice={payablePrice}
  deliveryScore={deliveryScore}
  orderPlacedAt={orderPlacedAt}
  summary={summary}
/>
```

`orderPlacedAt` 在点击下单时记录 `Date.now()`，所以小票里的“下单时间”会同步真实下单时间。

## 4. 人格到小票样式的映射

当前不是同时驱动 4 张结果票，而是根据 16 型吃商人格的前两位分成 4 组。用户也可以左右滑动预览其他样式。

```text
HC* -> magic  霍格沃茨 / 魔法事务所风
HE* -> anime  动漫能量补给站风
NC* -> plush  羊毛绒安抚联风
NE* -> ink    水墨热敏打印联风
```

组件内对应配置在 `receiptGroups` 和 `receiptGroupOrder`。

## 5. 小票内容规则

小票顶部只保留：

```text
快乐下单事务所
订单编号
下单时间
```

已经移除：

```text
人格介绍
人格代码
坐标轴代码
人标
能量坐标轴
```

菜品明细会完整显示购物车内所有菜品，不再出现“另有 N 件餐品写入完整订单”。

金额明细规则：

```text
商品原价 = totals.price
配送费 = 0.00
包装费 = 0.00
优惠券 = baseCouponDiscount
神券膨胀 = couponBoostDiscount
实付总额 = totals.price - couponDiscount
```

其中 `couponDiscount = baseCouponDiscount + couponBoostDiscount`，所以小票金额和购物车实付金额保持一致。

## 6. 交互规则

小票纸张区域支持鼠标或触控左右滑动切换样式。

底部仍保留 1-4 的样式切换按钮，方便调试和演示时快速切换。

结果页支持继续下滑解锁吃商人格卡：

```text
用户在小票结果页向下滚动或上滑触控 -> 自动把吃商人格卡滚到当前屏幕顶部
```

相关逻辑在 `App.tsx`：

```text
resultScreenRef
personaCardRef
handleResultWheel
handleResultTouchStart
handleResultTouchMove
revealPersonaCard
```

## 7. 当前已验证

本地验证命令：

```bash
cd modules/frontend
npm run build
```

验证结果：`tsc -b && vite build` 通过。

浏览器流程验证：

```text
开始游戏 -> 选择加班 -> 加班幸运包 -> 下单 -> 完成配送选择 -> 结果页
```

已确认：

```text
小票显示真实下单时间
小票不显示 HEGS / 人格名 / 坐标轴 / 能量坐标轴
菜品完整显示，不折叠
四种样式高度一致
条形码下方空白已收紧到约 8-12px
底部神券膨胀金额和实付总额对应正确
左右滑动可以切换小票样式
继续下滑可以自动进入吃商人格卡部分
```

## 8. 后续整合建议

如果后续要接后端或 AI 结果，只需要保证 `summary.foodPersona.code` 是合法 16 型人格代码：

```text
HCGS / HCGL / HCRS / HCRL
HEGS / HEGL / HERS / HERL
NCGS / NCGL / NCRS / NCRL
NEGS / NEGL / NERS / NERL
```

小票组件会自动按前两位选择默认样式。

如果后续要调整小票视觉，优先改：

```text
FinalPersonaReceipt.tsx 里的 receiptGroups
styles.css 里的 .final-persona-receipt.* 和 .final-receipt-* 样式
```

如果要继续缩短小票，不建议再隐藏菜品；可以优先压缩 `final-persona-proof` 或底部切换器区域。
