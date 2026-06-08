import { Link } from 'react-router-dom';
import { calcAge, daysBetween, formatDate } from '../lib/date';
import type { PetProfile } from '../lib/types';
import { Button } from './Button';

interface PetProfileCardProps {
  pet: PetProfile;
  showLink?: boolean;
  compact?: boolean;
}

export function PetProfileCard({ pet, showLink = true, compact }: PetProfileCardProps) {
  const age = calcAge(pet.birthday);
  const companionDays = daysBetween(pet.home_date);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className={`flex gap-4 ${compact ? 'p-4' : 'p-5'}`}>
        <div className="shrink-0">
          {pet.avatar_url ? (
            <img
              src={pet.avatar_url}
              alt={pet.name}
              className={`rounded-2xl object-cover ${compact ? 'h-16 w-16' : 'h-24 w-24'}`}
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-2xl bg-warm-100 text-warm-400 ${
                compact ? 'h-16 w-16 text-2xl' : 'h-24 w-24 text-4xl'
              }`}
            >
              🐾
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold text-ink ${compact ? 'text-lg' : 'text-xl'}`}>
            {pet.name}
          </h2>
          <div className="mt-1 space-y-0.5 text-sm text-ink/60">
            {pet.breed && <p>{pet.breed}</p>}
            {pet.gender && <p>{pet.gender}</p>}
            {pet.birthday && <p>生日 {formatDate(pet.birthday)}</p>}
            {age !== '未知' && <p>年龄 {age}</p>}
            {companionDays !== null && <p>陪伴 {companionDays} 天</p>}
          </div>
        </div>
      </div>

      {showLink && (
        <div className="border-t border-warm-100 px-5 py-3">
          <Link to="/dog">
            <Button variant="secondary" size="sm" fullWidth>
              查看成长时间轴
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
