import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { products } from '../../../mocks/products';
import { useCart } from '../../../contexts/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-6"></i>
          <h1 className="text-3xl font-bold text-[#00272B] mb-3">Produit non trouvé</h1>
          <Link to="/produits" className="text-[#1AAA3F] hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products.filter(p => 
    product.relatedProducts.includes(p.id) && p.isAvailable
  );

  const calculateDiscount = (qty: number) => {
    const applicable = product.volumeDiscounts
      .filter(d => qty >= d.quantity)
      .sort((a, b) => b.discount - a.discount);
    return applicable.length > 0 ? applicable[0].discount : 0;
  };

  const discount = calculateDiscount(quantity);
  const unitPrice = product.price;
  const discountedPrice = unitPrice * (1 - discount / 100);
  const totalPrice = discountedPrice * quantity;

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    navigate('/panier');
  };

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <Navbar />

      {/* Breadcrumb */}
      <section className="pt-32 pb-8 bg-[#EEFFF2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-[#1AAA3F]">Accueil</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link to="/produits" className="text-gray-600 hover:text-[#1AAA3F]">Produits</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link to={`/produits?category=${product.category}`} className="text-gray-600 hover:text-[#1AAA3F]">
              {product.category}
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-[#00272B] font-semibold">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain object-center p-12"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-2 ring-[#1AAA3F]' : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain object-center p-3"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  {product.isNew && (
                    <span className="inline-block px-3 py-1 bg-[#25A9F2] text-white text-xs font-semibold rounded-full mb-3">
                      Nouveau
                    </span>
                  )}
                  {product.isPopular && (
                    <span className="inline-block px-3 py-1 bg-[#1AAA3F] text-white text-xs font-semibold rounded-full mb-3 ml-2">
                      Populaire
                    </span>
                  )}
                  <p className="text-sm text-[#1AAA3F] font-semibold mb-2">{product.brand}</p>
                </div>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>

              <h1 className="text-4xl font-bold text-[#00272B] mb-4">{product.name}</h1>
              <p className="text-base text-gray-600 mb-6">{product.format}</p>

              {/* Price */}
              <div className="bg-[#EEFFF2] rounded-2xl p-6 mb-8">
                <div className="flex items-baseline space-x-3 mb-2">
                  <p className="text-4xl font-bold text-[#00272B]">
                    {discountedPrice.toLocaleString('fr-FR')} <span className="text-xl">FCFA</span>
                  </p>
                  {discount > 0 && (
                    <p className="text-xl text-gray-400 line-through">
                      {unitPrice.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600">Prix unitaire</p>
              </div>

              {/* Volume Discounts */}
              {product.volumeDiscounts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-[#00272B] mb-4">Remises par volume</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {product.volumeDiscounts.map((vd, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          quantity >= vd.quantity
                            ? 'border-[#1AAA3F] bg-[#EEFFF2]'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="text-2xl font-bold text-[#1AAA3F] mb-1">-{vd.discount}%</p>
                        <p className="text-xs text-gray-600">Dès {vd.quantity} unités</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-[#00272B] mb-4">Quantité</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <i className="ri-subtract-line text-xl text-[#00272B]"></i>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 h-12 text-center text-lg font-bold text-[#00272B] border-x-2 border-gray-200 focus:outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <i className="ri-add-line text-xl text-[#00272B]"></i>
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong className="text-[#00272B]">{product.stock}</strong> en stock
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl mb-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-[#00272B]">
                    {totalPrice.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                  </p>
                </div>
                {discount > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Économie</p>
                    <p className="text-2xl font-bold text-[#1AAA3F]">
                      -{((unitPrice - discountedPrice) * quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable}
                  className="flex-1 h-16 bg-[#1AAA3F] text-white text-lg font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line text-2xl"></i>
                  <span>{product.isAvailable ? 'Ajouter au panier' : 'Rupture de stock'}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.isAvailable}
                  className="flex-1 h-16 bg-[#00272B] text-white text-lg font-semibold rounded-xl hover:bg-[#003d42] transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 whitespace-nowrap"
                >
                  <span>Acheter maintenant</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-[#EEFFF2] border border-[#1AAA3F] rounded-xl flex items-center space-x-3">
                  <i className="ri-checkbox-circle-fill text-2xl text-[#1AAA3F]"></i>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1AAA3F]">Produit ajouté au panier !</p>
                    <Link to="/panier" className="text-xs text-[#00272B] hover:underline">
                      Voir mon panier
                    </Link>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3 text-gray-600">
                  <i className="ri-truck-line text-xl text-[#1AAA3F]"></i>
                  <span>Livraison gratuite dès 50 000 FCFA</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <i className="ri-shield-check-line text-xl text-[#1AAA3F]"></i>
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-20">
            <div className="border-b border-gray-200 mb-8">
              <div className="flex space-x-8">
                <button className="pb-4 px-2 border-b-2 border-[#1AAA3F] text-base font-semibold text-[#1AAA3F] whitespace-nowrap">
                  Description
                </button>
                <button className="pb-4 px-2 border-b-2 border-transparent text-base font-semibold text-gray-400 hover:text-[#00272B] transition-colors whitespace-nowrap">
                  Ingrédients & Allergènes
                </button>
                <button className="pb-4 px-2 border-b-2 border-transparent text-base font-semibold text-gray-400 hover:text-[#00272B] transition-colors whitespace-nowrap">
                  Compatibilité
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-[#00272B] mb-4">Description du produit</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-8">
                  {product.description}
                </p>

                <div className="bg-[#EEFFF2] rounded-2xl p-8 mb-8">
                  <h4 className="text-lg font-semibold text-[#00272B] mb-4">Ingrédients</h4>
                  <p className="text-sm text-gray-700 mb-6">{product.ingredients}</p>

                  <h4 className="text-lg font-semibold text-[#00272B] mb-4">Allergènes</h4>
                  <p className="text-sm text-gray-700">{product.allergens}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <h4 className="text-lg font-semibold text-[#00272B] mb-4">Compatible avec</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.compatibility.map((machine, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
                      >
                        {machine}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-[#00272B] rounded-2xl p-8 text-white">
                  <i className="ri-customer-service-2-line text-5xl mb-6"></i>
                  <h4 className="text-xl font-bold mb-3">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-300 mb-6">
                    Notre équipe est à votre disposition pour vous conseiller.
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full h-12 bg-white text-[#00272B] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-[#00272B] mb-8">Produits similaires</h2>
              <div className="grid grid-cols-4 gap-8">
                {relatedProducts.map(relatedProduct => (
                  <Link
                    key={relatedProduct.id}
                    to={`/produits/${relatedProduct.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-[#1AAA3F] hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain object-center p-6 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-[#1AAA3F] font-semibold mb-2">{relatedProduct.brand}</p>
                      <h3 className="text-base font-bold text-[#00272B] mb-2 group-hover:text-[#1AAA3F] transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xl font-bold text-[#00272B]">
                        {relatedProduct.price.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}