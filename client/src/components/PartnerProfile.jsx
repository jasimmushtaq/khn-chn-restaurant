import { ShieldCheck, Star, Truck, Phone, MessageSquare } from 'lucide-react';

const PartnerProfile = ({ partner, showPhoto }) => {
  if (!partner) return null;

  const scrollToChat = () => {
    const chatSection = document.getElementById('order-chat');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show only first name
  const firstName = partner.name.split(' ')[0];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in">
      <div className="flex items-center gap-6">
        {/* Photo with Trust Badge */}
        <div className="relative">
          {showPhoto ? (
            <img 
              src={partner.photoUrl || '/default-avatar.png'} 
              alt={firstName}
              className="w-20 h-20 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner border border-gray-200">
               <ShieldCheck size={32} />
            </div>
          )}
          {partner.idVerified && (
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="ID Verified">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-gray-900">{firstName}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-700">{partner.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Truck size={16} className="text-gray-400" />
              <span className="font-medium">{partner.vehicleType} · <span className="text-gray-900">{partner.plate}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 justify-end">
              <span className="font-bold text-gray-900">{partner.totalDeliveries}+</span>
              <span>Deliveries</span>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-3 flex items-center gap-3">
            {partner.bgChecked && (
              <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                Background Checked
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              Verified Partner
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <a 
          href={`tel:${partner.proxyPhone}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Phone size={18} /> Call
        </a>
        <button 
          onClick={scrollToChat}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <MessageSquare size={18} /> Chat
        </button>
      </div>
    </div>
  );
};

export default PartnerProfile;
