import { useEffect, useMemo, useState } from 'react';
import type { ScreenProps } from '../App';
import { pickQuiz, recordQuiz } from '../lib/quiz';
import { gifUrl, type Exercise } from '../lib/exercises';

export function Rest({ state, update, today, seconds, next, onNext }: Pick<ScreenProps, 'state' | 'update' | 'today'> & {
  seconds: number;
  next: Exercise;
  onNext: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [picked, setPicked] = useState<number>();
  // Fixed for the whole break so answering does not swap the question underneath the player.
  const quiz = useMemo(() => pickQuiz(state.quiz?.seen ?? {}, Number(today.replace(/-/g, '')) + state.logs.length), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const answer = (i: number) => {
    if (picked !== undefined) return;
    setPicked(i);
    update((s) => recordQuiz(s, quiz.id, i === quiz.answer));
  };

  return (
    <>
      <div className="card hero">
        <div className="muted">休憩</div>
        <div className="timer">{left > 0 ? left : 0}<small style={{ fontSize: 20 }}>秒</small></div>
        <div className="muted">次は「{next.name}」</div>
        <div className="muted">{next.category === 'stretch' ? '伸ばす場所' : '効く場所'}：{next.muscles}</div>
      </div>

      <div className="card">
        <span className="pill">健康クイズ</span>
        <p style={{ margin: '8px 0' }}><b>{quiz.q}</b></p>
        <div className="feel">
          {quiz.choices.map((c, i) => {
            const state = picked === undefined ? '' : i === quiz.answer ? 'primary' : i === picked ? 'danger' : '';
            return (
              <button key={c} className={state} disabled={picked !== undefined && i !== picked && i !== quiz.answer} onClick={() => answer(i)}>
                {c}
              </button>
            );
          })}
        </div>
        {picked !== undefined && (
          <p style={{ marginTop: 12 }}>
            <b>{picked === quiz.answer ? '正解！' : `答えは「${quiz.choices[quiz.answer]}」`}</b>
            <br />
            {quiz.why}
          </p>
        )}
      </div>

      <button className={`big ${left <= 0 ? 'accent' : ''}`} onClick={onNext}>
        {left <= 0 ? '休憩おわり！次の種目へ' : '休憩を飛ばして次の種目へ'}
      </button>
      <img className="gif small" src={gifUrl(next.id)} alt={`${next.name}の動き`} />
    </>
  );
}
