<template>
<div class="paramHelp" role="note" aria-label="参数说明">
  <div class="paramHelpTitle">参数说明</div>
  <ul class="paramHelpList">
    <li>
      <b>可接受定数区间</b>：用于<b>筛选</b>该玩家能接受的谱面定数范围（含边界）
    </li>
    <li>
      <b>期望定数（排序用）</b>：用于<b>排序</b>——优先把“谱面定数更接近期望值（Δ更小）”的歌曲排在前面（优先级见上方“排序优先级”）。
    </li>
    <li>
      <b>期望差距阈值</b>：用于从“期望定数”推导区间：<b>[期望-阈值, 期望+阈值]</b>（含）；调大更宽松。（每首歌曲都包含一个真实隐藏等级，如 True Love Song 在 Master 等级展示为
      12，而隐藏真实等级为 12.4，阈值是用来处理真实等级的工具）
    </li>
    <li>
      <b>额外筛选</b>：可添加多个条件（按<b>或</b>合并，命中任一条件即生效）。通过“<b>包含/不包含</b>”选择保留或剔除命中条件的歌曲；目前支持按<b>专辑（曲目分类）</b>筛选，并会自动保存到本地。
    </li>
  </ul>
  <div class="paramHelpFoot muted">提示：关闭“手动输入定数”时，定数以 0.5 为步进；手动输入支持 0.1。</div>
</div>
</template>

<style scoped>
.paramHelp {
  margin-top: 12px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 12px 12px 10px;
  background: var(--c-surface);
}

.paramHelpTitle {
  font-size: 13px;
  color: var(--c-text-subtle);
  margin-bottom: 8px;
}

.paramHelpList {
  margin: 0;
  padding-left: 18px;
  color: var(--c-text);
  font-size: 13px;
  line-height: 1.6;
}

.paramHelpList li+li {
  margin-top: 6px;
}

.paramHelpFoot {
  margin-top: 8px;
  font-size: 12px;
}
</style>
